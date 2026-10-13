package com.cleanroute.service;

import com.cleanroute.model.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

@Service
public class StoreService {

    @Value("${app.data-dir:./data}")
    private String dataDir;

    private final Map<String, Municipality> municipalities = new LinkedHashMap<>();
    private final Map<String, List<Bin>> binsOf = new HashMap<>();
    private final Map<String, Bin> depotOf = new HashMap<>();
    private final Map<String, Household> households = new LinkedHashMap<>();
    private final Map<String, User> users = new LinkedHashMap<>();
    private final List<Ping> pings = new ArrayList<>();
    private final Map<String, Map<String, Object>> dispatches = new HashMap<>();
    private final Random rng = new Random();
    private int nextPingId = 10001;
    private Path dbDir;

    public synchronized void initialize() {
        dbDir = Paths.get(dataDir, "db");
        try {
            loadMunicipalities();
            boolean fresh = !Files.exists(dbDir.resolve("users.tsv"));
            Files.createDirectories(dbDir);
            if (!fresh) {
                loadHouseholds();
                loadUsers();
                loadPings();
            }
            // Seeding is handled by SeedService after initialization
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize store", e);
        }
    }

    private void loadMunicipalities() throws IOException {
        Path csv = Paths.get(dataDir, "municipalities.csv");
        List<String> lines = Files.readAllLines(csv, StandardCharsets.UTF_8);
        for (int i = 1; i < lines.size(); i++) {
            String line = lines.get(i).trim();
            if (line.isEmpty()) continue;
            String[] f = line.split(",");
            Municipality m = new Municipality(f[0].trim(), f[1].trim(), Double.parseDouble(f[2].trim()));
            loadBins(m);
            municipalities.put(m.id, m);
        }
    }

    private void loadBins(Municipality m) throws IOException {
        Path csv = Paths.get(dataDir, "bins-" + m.id + ".csv");
        List<String> lines = Files.readAllLines(csv, StandardCharsets.UTF_8);
        List<Bin> bins = new ArrayList<>();
        Bin depot = null;
        for (int i = 1; i < lines.size(); i++) {
            String line = lines.get(i).trim();
            if (line.isEmpty()) continue;
            String[] f = line.split(",");
            int id = Integer.parseInt(f[0].trim());
            Bin b = new Bin(id, f[1].trim(), Double.parseDouble(f[2].trim()), Double.parseDouble(f[3].trim()), 0);
            if (id == 0) depot = b;
            else bins.add(b);
        }
        if (depot == null) throw new IllegalStateException("No depot row (id=0) in bins-" + m.id + ".csv");
        m.lat = depot.lat;
        m.lng = depot.lng;
        depotOf.put(m.id, depot);
        binsOf.put(m.id, bins);
        randomiseFill(m.id);
    }

    public synchronized void randomiseFill(String municipalityId) {
        List<Bin> bins = binsOf.get(municipalityId);
        if (bins != null) for (Bin b : bins) b.fill = 10 + rng.nextInt(91);
    }

    private void loadHouseholds() throws IOException {
        for (String[] f : readTable("households.tsv", 5)) {
            Household h = new Household(f[0], f[1], f[2], f[3], Boolean.parseBoolean(f[4]));
            households.put(h.id.toUpperCase(), h);
        }
    }

    private void loadUsers() throws IOException {
        for (String[] f : readTable("users.tsv", 10)) {
            User u = new User(f[0], f[1], f[2], f[3], f[4], f[5], f[6], f[7],
                    Integer.parseInt(f[8]), Integer.parseInt(f[9]));
            users.put(u.username, u);
        }
    }

    private void loadPings() throws IOException {
        for (String[] f : readTable("pings.tsv", 13)) {
            Ping p = new Ping(Integer.parseInt(f[0]), f[1], f[2],
                    Double.parseDouble(f[3]), Double.parseDouble(f[4]), f[5], f[6], f[7], Long.parseLong(f[8]));
            p.resolvedAt = Long.parseLong(f[9]);
            if (!f[10].isEmpty()) p.supporters.addAll(Arrays.asList(f[10].split(",")));
            p.kind = f[11];
            p.hasPhoto = Boolean.parseBoolean(f[12]);
            pings.add(p);
            nextPingId = Math.max(nextPingId, p.id + 1);
        }
    }

    // --- Saving ---

    public synchronized void saveHouseholds() {
        List<String> lines = new ArrayList<>();
        for (Household h : households.values())
            lines.add(row(h.id, h.municipalityId, h.ward, h.code, String.valueOf(h.activated)));
        writeTable("households.tsv", lines);
    }

    public synchronized void saveUsers() {
        List<String> lines = new ArrayList<>();
        for (User u : users.values())
            lines.add(row(u.username, u.salt, u.hash, u.role, u.municipalityId, u.householdId,
                    u.nickname, u.ward, String.valueOf(u.points), String.valueOf(u.strikes)));
        writeTable("users.tsv", lines);
    }

    public synchronized void savePings() {
        List<String> lines = new ArrayList<>();
        for (Ping p : pings)
            lines.add(row(String.valueOf(p.id), p.municipalityId, p.reporter,
                    String.valueOf(p.lat), String.valueOf(p.lng), p.size, p.note, p.status,
                    String.valueOf(p.createdAt), String.valueOf(p.resolvedAt),
                    String.join(",", p.supporters), p.kind, String.valueOf(p.hasPhoto)));
        writeTable("pings.tsv", lines);
    }

    public synchronized void saveAll() { saveHouseholds(); saveUsers(); savePings(); }

    public synchronized void savePhoto(int id, byte[] jpeg) throws IOException {
        Path dir = dbDir.resolve("photos");
        Files.createDirectories(dir);
        Files.write(dir.resolve(id + ".jpg"), jpeg);
    }

    public synchronized byte[] readPhoto(int id) throws IOException {
        Path p = dbDir.resolve("photos").resolve(id + ".jpg");
        return Files.exists(p) ? Files.readAllBytes(p) : null;
    }

    public synchronized int newPingId() { return nextPingId++; }

    // --- Lookups ---
    public synchronized User getUser(String username) {
        return username == null ? null : users.get(username.toLowerCase());
    }
    public synchronized Ping getPing(int id) {
        return pings.stream().filter(p -> p.id == id).findFirst().orElse(null);
    }
    public synchronized List<Ping> getPings() { return Collections.unmodifiableList(pings); }
    public synchronized void addPing(Ping p) { pings.add(p); }
    public synchronized Map<String, Municipality> getMunicipalities() { return Collections.unmodifiableMap(municipalities); }
    public synchronized Municipality getMunicipality(String id) { return municipalities.get(id); }
    public synchronized List<Bin> getBinsOf(String municipalityId) { return binsOf.get(municipalityId); }
    public synchronized Bin getDepotOf(String municipalityId) { return depotOf.get(municipalityId); }
    public synchronized Map<String, Household> getHouseholds() { return Collections.unmodifiableMap(households); }
    public synchronized Household getHousehold(String id) { return households.get(id.toUpperCase()); }
    public synchronized void putHousehold(Household h) { households.put(h.id.toUpperCase(), h); }
    public synchronized Map<String, User> getUsers() { return Collections.unmodifiableMap(users); }
    public synchronized void putUser(User u) { users.put(u.username.toLowerCase(), u); }
    public synchronized Map<String, Object> getDispatch(String municipalityId) { return dispatches.get(municipalityId); }
    public synchronized void setDispatch(String municipalityId, Map<String, Object> dispatch) { dispatches.put(municipalityId, dispatch); }
    public synchronized boolean hasUsers() { return !users.isEmpty(); }

    // --- File helpers ---
    private List<String[]> readTable(String file, int columns) throws IOException {
        List<String[]> rows = new ArrayList<>();
        Path p = dbDir.resolve(file);
        if (!Files.exists(p)) return rows;
        for (String line : Files.readAllLines(p, StandardCharsets.UTF_8)) {
            if (line.isEmpty()) continue;
            String[] raw = line.split("\t", -1);
            if (raw.length != columns) throw new IOException(file + ": expected " + columns + " columns, got " + raw.length);
            String[] f = new String[columns];
            for (int i = 0; i < columns; i++) f[i] = java.net.URLDecoder.decode(raw[i], "UTF-8");
            rows.add(f);
        }
        return rows;
    }

    private void writeTable(String file, List<String> lines) {
        try {
            Files.createDirectories(dbDir);
            Path tmp = dbDir.resolve(file + ".tmp");
            Files.write(tmp, lines, StandardCharsets.UTF_8);
            Files.move(tmp, dbDir.resolve(file), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Could not save " + file, e);
        }
    }

    private static String row(String... fields) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < fields.length; i++) {
            if (i > 0) sb.append('\t');
            try { sb.append(java.net.URLEncoder.encode(fields[i], "UTF-8")); }
            catch (Exception e) { sb.append(fields[i]); }
        }
        return sb.toString();
    }
}
