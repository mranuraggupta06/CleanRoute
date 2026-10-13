package com.cleanroute.service;

import com.cleanroute.model.*;
import com.cleanroute.solver.Geo;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
public class RulesService {

    public static final int MAX_PINGS_PER_DAY = 3;
    public static final double DUPLICATE_RADIUS_M = 40;
    public static final int STRIKE_LIMIT = 3;
    public static final int SUPPORT_POINTS = 2;

    private static final String CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private final Random random = new Random();

    public User login(StoreService store, AuthService auth, String username, String password, String expectedRole) {
        String key = username.trim().toLowerCase();
        if (auth.isLocked(key)) throw new RuntimeException("Too many failed attempts. Try again in a few minutes.");

        User u = store.getUser(key);
        boolean ok = u != null && auth.matches(password, u.salt, u.hash);
        if (!ok) {
            auth.recordFailure(key);
            throw new RuntimeException("Wrong username or password.");
        }
        auth.clearFailures(key);
        if (!expectedRole.isEmpty() && !expectedRole.equals(u.role)) {
            throw new RuntimeException(User.DISPATCHER.equals(u.role)
                    ? "This is a municipality account. Choose \u201cMunicipality\u201d to sign in."
                    : "This is a household account. Choose \u201cResident\u201d to sign in.");
        }
        return u;
    }

    public User register(StoreService store, AuthService auth, String municipalityId, String householdId,
                          String code, String nickname, String password) {
        nickname = nickname.trim();
        if (!nickname.matches("[A-Za-z0-9 _-]{3,20}"))
            throw new RuntimeException("Nickname must be 3-20 characters: letters, numbers, spaces, - or _.");
        if (password.length() < 6)
            throw new RuntimeException("Password must be at least 6 characters.");

        String hid = householdId.trim().toUpperCase();
        String salt = auth.newSalt();
        String hash = auth.hash(password, salt);

        synchronized (store) {
            Municipality m = store.getMunicipality(municipalityId);
            if (m == null) throw new RuntimeException("Choose your municipality.");
            Household h = store.getHousehold(hid);
            boolean codeOk = h != null && h.municipalityId.equals(m.id)
                    && h.code != null && !h.code.isEmpty() && h.code.equalsIgnoreCase(code.trim());
            if (!codeOk) {
                if (h != null && h.activated)
                    throw new RuntimeException("That household may already be activated. Try signing in.");
                throw new RuntimeException("Household ID and activation code do not match the municipality's records.");
            }
            for (User other : store.getUsers().values()) {
                if (other.municipalityId.equals(m.id) && other.nickname.equalsIgnoreCase(nickname))
                    throw new RuntimeException("That nickname is already taken. Choose another.");
            }
            User u = new User(h.id.toLowerCase(), salt, hash, User.RESIDENT, m.id, h.id, nickname, h.ward, 0, 0);
            store.putUser(u);
            h.activated = true;
            h.code = "";
            store.saveUsers();
            store.saveHouseholds();
            return u;
        }
    }

    public Household addHousehold(StoreService store, User staff, String houseNo, String ward) {
        String no = houseNo.trim().toUpperCase().replaceAll("[^A-Z0-9-]", "");
        if (no.isEmpty() || no.length() > 12)
            throw new RuntimeException("House number: use letters, numbers and - only (up to 12 characters).");
        ward = ward.trim();
        if (!ward.matches("[A-Za-z0-9 -]{1,20}"))
            throw new RuntimeException("Ward: use letters, numbers, spaces and - only (up to 20 characters).");

        synchronized (store) {
            Municipality m = store.getMunicipality(staff.municipalityId);
            String id = m.prefix() + "-" + no;
            if (store.getHousehold(id) != null)
                throw new RuntimeException("House " + id + " is already registered.");
            Household h = new Household(id, m.id, ward, randomCode(6), false);
            store.putHousehold(h);
            store.saveHouseholds();
            return h;
        }
    }

    public static class PingResult {
        public final Ping ping;
        public final boolean merged;
        public PingResult(Ping ping, boolean merged) { this.ping = ping; this.merged = merged; }
    }

    public PingResult createPing(StoreService store, User u, double lat, double lng,
                                   String size, String kind, String note, byte[] photo) {
        if (!Ping.validSize(size)) throw new RuntimeException("Choose how much waste there is.");
        if (kind == null || kind.isEmpty()) kind = "Household garbage";
        if (!Ping.validKind(kind)) throw new RuntimeException("Choose what kind of waste it is.");
        if (photo == null || photo.length == 0)
            throw new RuntimeException("A photo of the waste is required.");
        if (photo.length > 600 * 1024)
            throw new RuntimeException("That photo is too large. Please choose a smaller one.");
        boolean jpeg = photo.length > 3 && (photo[0] & 0xFF) == 0xFF && (photo[1] & 0xFF) == 0xD8 && (photo[2] & 0xFF) == 0xFF;
        if (!jpeg) throw new RuntimeException("The photo must be a JPEG image.");

        String cleanNote = note == null ? "" : note.replaceAll("\\p{Cntrl}", " ").trim();
        if (cleanNote.length() > 140) cleanNote = cleanNote.substring(0, 140);

        synchronized (store) {
            Municipality m = store.getMunicipality(u.municipalityId);
            if (u.strikes >= STRIKE_LIMIT)
                throw new RuntimeException("Reporting is paused for your household because " + STRIKE_LIMIT + " reports were found incorrect. Contact the municipality.");

            double away = Geo.haversineKm(m.lat, m.lng, lat, lng);
            if (away > m.radiusKm)
                throw new RuntimeException(String.format(Locale.ROOT, "That spot is %.1f km from the depot, outside the %.1f km service area.", away, m.radiusKm));

            for (Ping p : store.getPings()) {
                if (!p.municipalityId.equals(m.id) || !Ping.isOpen(p.status)) continue;
                if (Geo.haversineKm(p.lat, p.lng, lat, lng) * 1000 <= DUPLICATE_RADIUS_M) {
                    if (p.reporter.equals(u.username) || p.supporters.contains(u.username))
                        throw new RuntimeException("You have already reported this spot (report #" + p.id + ").");
                    p.supporters.add(u.username);
                    if (Ping.VERIFIED.equals(p.status)) {
                        u.points += SUPPORT_POINTS;
                        store.saveUsers();
                    }
                    store.savePings();
                    return new PingResult(p, true);
                }
            }

            if (reportsToday(store, u) >= MAX_PINGS_PER_DAY)
                throw new RuntimeException("You have used all " + MAX_PINGS_PER_DAY + " reports for today. Try again tomorrow.");

            Ping p = new Ping(store.newPingId(), m.id, u.username, lat, lng, size, cleanNote, Ping.PENDING, System.currentTimeMillis());
            p.kind = kind;
            try { store.savePhoto(p.id, photo); } catch (Exception e) {
                throw new RuntimeException("Could not save the photo. Please try again.");
            }
            p.hasPhoto = true;
            store.addPing(p);
            store.savePings();
            return new PingResult(p, false);
        }
    }

    public void reviewPing(StoreService store, User staff, int id, String action) {
        reviewPing(store, staff, id, action, null);
    }

    public void reviewPing(StoreService store, User staff, int id, String action, String note) {
        synchronized (store) {
            Ping p = ownPing(store, staff, id);
            if (!Ping.PENDING.equals(p.status)) throw new RuntimeException("This report has already been reviewed.");
            if ("verify".equals(action)) {
                p.status = Ping.VERIFIED;
                User reporter = store.getUser(p.reporter);
                if (reporter != null) reporter.points += Ping.sizePoints(p.size);
                for (String name : p.supporters) {
                    User s = store.getUser(name);
                    if (s != null) s.points += SUPPORT_POINTS;
                }
                store.saveUsers();
            } else if ("reject".equals(action)) {
                p.status = Ping.REJECTED;
                p.resolvedAt = System.currentTimeMillis();
            } else {
                throw new RuntimeException("Action must be verify or reject.");
            }
            if (note != null && !note.trim().isEmpty()) {
                p.note = note.trim();
            }
            store.savePings();
        }
    }

    public void completePing(StoreService store, User staff, int id, String outcome) {
        synchronized (store) {
            Ping p = ownPing(store, staff, id);
            if (!Ping.VERIFIED.equals(p.status)) throw new RuntimeException("Only accepted reports can be closed.");
            User reporter = store.getUser(p.reporter);
            if ("genuine".equals(outcome)) {
                p.status = Ping.COLLECTED;
            } else if ("false".equals(outcome)) {
                p.status = Ping.FALSE_REPORT;
                if (reporter != null) {
                    reporter.strikes++;
                    reporter.points = Math.max(0, reporter.points - Ping.sizePoints(p.size));
                }
                for (String name : p.supporters) {
                    User s = store.getUser(name);
                    if (s != null) s.points = Math.max(0, s.points - SUPPORT_POINTS);
                }
            } else {
                throw new RuntimeException("Outcome must be genuine or false.");
            }
            p.resolvedAt = System.currentTimeMillis();
            store.saveUsers();
            store.savePings();
        }
    }

    public byte[] photoFor(StoreService store, User viewer, int id) throws java.io.IOException {
        synchronized (store) {
            Ping p = store.getPing(id);
            if (p == null || !p.hasPhoto || !p.municipalityId.equals(viewer.municipalityId))
                throw new RuntimeException("Photo not found.");
            boolean staff = User.DISPATCHER.equals(viewer.role);
            if (!staff && !p.reporter.equals(viewer.username)) throw new RuntimeException("Photo not found.");
            byte[] b = store.readPhoto(id);
            if (b == null) throw new RuntimeException("Photo not found.");
            return b;
        }
    }

    public int reportsToday(StoreService store, User u) {
        long midnight = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli();
        int count = 0;
        for (Ping p : store.getPings()) {
            if (p.reporter.equals(u.username) && p.createdAt >= midnight) count++;
        }
        return count;
    }

    private Ping ownPing(StoreService store, User staff, int id) {
        Ping p = store.getPing(id);
        if (p == null || !p.municipalityId.equals(staff.municipalityId))
            throw new RuntimeException("Report not found.");
        return p;
    }

    private String randomCode(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) sb.append(CODE_ALPHABET.charAt(random.nextInt(CODE_ALPHABET.length())));
        return sb.toString();
    }
}
