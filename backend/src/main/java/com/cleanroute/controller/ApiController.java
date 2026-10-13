package com.cleanroute.controller;

import com.cleanroute.model.*;
import com.cleanroute.service.*;
import com.cleanroute.solver.Geo;
import com.cleanroute.solver.Planner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    @Autowired private StoreService store;
    @Autowired private AuthService auth;
    @Autowired private RulesService rules;
    @Autowired private SeedService seed;
    @Autowired private Planner planner;

    // ---- Auth helpers ----

    private User currentUser(HttpServletRequest req) {
        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        String username = auth.getUsernameFromToken(token);
        return username != null ? store.getUser(username) : null;
    }

    private User requireUser(HttpServletRequest req) {
        User u = currentUser(req);
        if (u == null) throw new RuntimeException("Please sign in.");
        return u;
    }

    private User requireDispatcher(HttpServletRequest req) {
        User u = requireUser(req);
        if (!User.DISPATCHER.equals(u.role)) throw new RuntimeException("Only municipality staff can do that.");
        return u;
    }

    private User requireResident(HttpServletRequest req) {
        User u = requireUser(req);
        if (!User.RESIDENT.equals(u.role)) throw new RuntimeException("Only registered households can do that.");
        return u;
    }

    // ---- Health check ----

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "UP");
        res.put("service", "CleanRoute Waste Optimizer API");
        res.put("timestamp", System.currentTimeMillis());
        return res;
    }

    // ---- Public endpoints ----

    @GetMapping("/municipalities")
    public List<Map<String, String>> getMunicipalities() {
        List<Map<String, String>> list = new ArrayList<>();
        for (Municipality m : store.getMunicipalities().values()) {
            Map<String, String> entry = new LinkedHashMap<>();
            entry.put("id", m.id);
            entry.put("name", m.name);
            list.add(entry);
        }
        return list;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> body) {
        seed.seed(store, auth);
        User u = rules.register(store, auth,
                body.getOrDefault("municipalityId", ""),
                body.getOrDefault("householdId", ""),
                body.getOrDefault("code", ""),
                body.getOrDefault("nickname", ""),
                body.getOrDefault("password", ""));
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", true);
        res.put("username", u.username);
        return res;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        seed.seed(store, auth);
        User u = rules.login(store, auth,
                body.getOrDefault("username", ""),
                body.getOrDefault("password", ""),
                body.getOrDefault("as", ""));
        String token = auth.createToken(u.username, u.role);
        Map<String, Object> res = buildMe(u);
        res.put("token", token);
        return res;
    }

    // ---- Signed-in user endpoints ----

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest req) {
        return buildMe(requireUser(req));
    }

    @GetMapping("/leaderboard")
    public Map<String, Object> leaderboard(HttpServletRequest req) {
        User u = requireUser(req);
        return buildLeaderboard(u.municipalityId);
    }

    // ---- Dispatcher endpoints ----

    @GetMapping("/state")
    public Map<String, Object> state(HttpServletRequest req) {
        User u = requireDispatcher(req);
        return buildDispatcherState(u);
    }

    @PostMapping("/simulate")
    public Map<String, Object> simulate(HttpServletRequest req) {
        User u = requireDispatcher(req);
        store.randomiseFill(u.municipalityId);
        return buildDispatcherState(u);
    }

    @GetMapping("/optimize")
    public Map<String, Object> optimize(HttpServletRequest req,
                                         @RequestParam(defaultValue="70") int threshold,
                                         @RequestParam(defaultValue="600") double truckCapacity,
                                         @RequestParam(defaultValue="100") double binCapacity,
                                         @RequestParam(defaultValue="3") int trucks,
                                         @RequestParam(defaultValue="false") boolean includePending) {
        User u = requireDispatcher(req);
        return planner.optimize(store, u.municipalityId, threshold, truckCapacity, binCapacity, trucks, includePending);
    }

    @PostMapping("/dispatch")
    public Map<String, Object> dispatch(HttpServletRequest req, @RequestBody Map<String, Object> body) {
        User u = requireDispatcher(req);
        int threshold = intVal(body, "threshold", 70);
        double truckCapacity = doubleVal(body, "truckCapacity", 600);
        double binCapacity = doubleVal(body, "binCapacity", 100);
        int trucks = intVal(body, "trucks", 3);
        int algorithm = intVal(body, "algorithm", -1);
        planner.dispatch(store, u.municipalityId, threshold, truckCapacity, binCapacity, trucks, algorithm);
        return buildDispatcherState(u);
    }

    @PostMapping("/pings/review")
    public Map<String, Object> reviewPing(HttpServletRequest req, @RequestBody Map<String, Object> body) {
        User u = requireDispatcher(req);
        rules.reviewPing(store, u, intVal(body, "id", 0), String.valueOf(body.get("action")));
        return buildDispatcherState(u);
    }

    @PostMapping("/pings/complete")
    public Map<String, Object> completePing(HttpServletRequest req, @RequestBody Map<String, Object> body) {
        User u = requireDispatcher(req);
        rules.completePing(store, u, intVal(body, "id", 0), String.valueOf(body.get("outcome")));
        return buildDispatcherState(u);
    }

    @GetMapping("/households")
    public List<Map<String, Object>> getHouseholds(HttpServletRequest req) {
        User u = requireDispatcher(req);
        List<Map<String, Object>> list = new ArrayList<>();
        for (Household h : store.getHouseholds().values()) {
            if (!h.municipalityId.equals(u.municipalityId)) continue;
            User resident = store.getUser(h.id.toLowerCase());
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", h.id);
            entry.put("ward", h.ward);
            entry.put("activated", h.activated);
            entry.put("code", h.activated ? "" : h.code);
            entry.put("nickname", resident == null ? "" : resident.nickname);
            entry.put("points", resident == null ? 0 : resident.points);
            entry.put("strikes", resident == null ? 0 : resident.strikes);
            list.add(entry);
        }
        return list;
    }

    @PostMapping("/households")
    public Map<String, Object> addHousehold(HttpServletRequest req, @RequestBody Map<String, String> body) {
        User u = requireDispatcher(req);
        Household h = rules.addHousehold(store, u, body.getOrDefault("houseNo", ""), body.getOrDefault("ward", ""));
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", h.id);
        res.put("code", h.code);
        return res;
    }

    // ---- Resident endpoints ----

    @GetMapping("/resident/home")
    public Map<String, Object> residentHome(HttpServletRequest req) {
        User u = requireResident(req);
        return buildResidentHome(u);
    }

    @PostMapping("/pings")
    public Map<String, Object> createPing(HttpServletRequest req, @RequestBody Map<String, Object> body) {
        User u = requireResident(req);
        double lat = doubleVal(body, "lat", Double.NaN);
        double lng = doubleVal(body, "lng", Double.NaN);
        String size = String.valueOf(body.get("size"));
        String kind = String.valueOf(body.get("kind"));
        String note = String.valueOf(body.getOrDefault("note", ""));
        String photoB64 = String.valueOf(body.get("photo"));
        byte[] photo;
        try {
            photo = Base64.getDecoder().decode(photoB64.trim());
        } catch (Exception e) {
            throw new RuntimeException("That photo could not be read. Please choose it again.");
        }
        RulesService.PingResult r = rules.createPing(store, u, lat, lng, size, kind, note, photo);
        String msg = r.merged
                ? "Someone nearby already reported this spot, so your confirmation was added to report #" + r.ping.id + "."
                : "Report #" + r.ping.id + " sent. A dispatcher will review it.";
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", true);
        res.put("merged", r.merged);
        res.put("id", r.ping.id);
        res.put("message", msg);
        return res;
    }

    @GetMapping(value = "/photo/{id}", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> getPhoto(HttpServletRequest req, @PathVariable int id) throws Exception {
        User u = requireUser(req);
        byte[] data = rules.photoFor(store, u, id);
        return ResponseEntity.ok()
                .header("Content-Type", "image/jpeg")
                .header("Cache-Control", "private, max-age=3600")
                .body(data);
    }

    // ---- View Builder Helpers ----

    private Map<String, Object> buildMe(User u) {
        Municipality m = store.getMunicipality(u.municipalityId);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("username", u.username);
        res.put("role", u.role);
        res.put("nickname", u.nickname);
        res.put("householdId", u.householdId);
        res.put("ward", u.ward);
        res.put("municipalityId", m.id);
        res.put("municipalityName", m.name);
        res.put("points", u.points);
        res.put("strikes", u.strikes);
        res.put("strikeLimit", RulesService.STRIKE_LIMIT);
        res.put("reportsToday", rules.reportsToday(store, u));
        res.put("maxReportsPerDay", RulesService.MAX_PINGS_PER_DAY);
        if (User.RESIDENT.equals(u.role)) {
            double[] home = Geo.homeOf(u.householdId, m.lat, m.lng, m.radiusKm);
            res.put("homeLat", home[0]);
            res.put("homeLng", home[1]);
        }
        return res;
    }

    private Map<String, Object> buildDispatcherState(User staff) {
        Municipality m = store.getMunicipality(staff.municipalityId);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("me", buildMe(staff));

        Map<String, Object> mun = new LinkedHashMap<>();
        mun.put("id", m.id);
        mun.put("name", m.name);
        mun.put("radiusKm", m.radiusKm);
        res.put("municipality", mun);

        Bin depot = store.getDepotOf(m.id);
        Map<String, Object> dep = new LinkedHashMap<>();
        dep.put("id", 0);
        dep.put("name", depot.name);
        dep.put("lat", depot.lat);
        dep.put("lng", depot.lng);
        res.put("depot", dep);

        List<Map<String, Object>> binList = new ArrayList<>();
        for (Bin b : store.getBinsOf(m.id)) {
            Map<String, Object> bm = new LinkedHashMap<>();
            bm.put("id", b.id);
            bm.put("name", b.name);
            bm.put("lat", b.lat);
            bm.put("lng", b.lng);
            bm.put("fill", b.fill);
            binList.add(bm);
        }
        res.put("bins", binList);

        List<Map<String, Object>> pingList = new ArrayList<>();
        List<Ping> open = new ArrayList<>(), closed = new ArrayList<>();
        for (Ping p : store.getPings()) {
            if (!p.municipalityId.equals(m.id)) continue;
            if (Ping.isOpen(p.status)) open.add(p); else closed.add(p);
        }
        open.sort(Comparator.comparingLong(p -> p.createdAt));
        closed.sort((a, b) -> Long.compare(b.resolvedAt, a.resolvedAt));
        if (closed.size() > 10) closed = closed.subList(0, 10);
        for (Ping p : open) pingList.add(staffPing(store, p));
        for (Ping p : closed) pingList.add(staffPing(store, p));
        res.put("pings", pingList);
        res.put("dispatch", store.getDispatch(m.id));
        return res;
    }

    private Map<String, Object> staffPing(StoreService store, Ping p) {
        User reporter = store.getUser(p.reporter);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.id);
        m.put("lat", p.lat);
        m.put("lng", p.lng);
        m.put("size", p.size);
        m.put("kg", Ping.sizeKg(p.size));
        m.put("status", p.status);
        m.put("note", p.note);
        m.put("kind", p.kind);
        m.put("photo", p.hasPhoto);
        m.put("reporter", reporter == null ? "unknown" : reporter.nickname);
        m.put("household", reporter == null ? "" : reporter.householdId);
        m.put("reporterStrikes", reporter == null ? 0 : reporter.strikes);
        m.put("supporters", p.supporters.size());
        m.put("createdAt", p.createdAt);
        m.put("resolvedAt", p.resolvedAt);
        return m;
    }

    private Map<String, Object> buildResidentHome(User u) {
        Municipality m = store.getMunicipality(u.municipalityId);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("me", buildMe(u));

        Map<String, Object> mun = new LinkedHashMap<>();
        mun.put("id", m.id);
        mun.put("name", m.name);
        mun.put("radiusKm", m.radiusKm);
        res.put("municipality", mun);

        Bin depot = store.getDepotOf(m.id);
        Map<String, Object> dep = new LinkedHashMap<>();
        dep.put("name", depot.name);
        dep.put("lat", depot.lat);
        dep.put("lng", depot.lng);
        res.put("depot", dep);

        List<Map<String, Object>> pingList = new ArrayList<>();
        for (Ping p : store.getPings()) {
            if (!p.municipalityId.equals(m.id)) continue;
            boolean isMine = p.reporter.equals(u.username) || p.supporters.contains(u.username);
            if (!isMine && !Ping.isOpen(p.status)) continue;
            Map<String, Object> pm = new LinkedHashMap<>();
            pm.put("id", p.id);
            pm.put("lat", p.lat);
            pm.put("lng", p.lng);
            pm.put("size", p.size);
            pm.put("status", p.status);
            pm.put("mine", isMine);
            pm.put("kind", p.kind);
            pm.put("owner", p.reporter.equals(u.username));
            pm.put("supporters", p.supporters.size());
            pm.put("createdAt", p.createdAt);
            if (isMine) {
                pm.put("note", p.note);
                pm.put("photo", p.hasPhoto);
                boolean paid = Ping.COLLECTED.equals(p.status) || Ping.VERIFIED.equals(p.status);
                int pts = 0;
                if (paid) pts = p.reporter.equals(u.username) ? Ping.sizePoints(p.size) : RulesService.SUPPORT_POINTS;
                pm.put("pointsEarned", pts);
            }
            pingList.add(pm);
        }
        res.put("pings", pingList);
        res.put("leaderboard", buildLeaderboard(m.id));
        res.put("dispatch", store.getDispatch(m.id));
        return res;
    }

    private Map<String, Object> buildLeaderboard(String municipalityId) {
        List<User> residents = new ArrayList<>();
        Map<String, Integer> genuine = new HashMap<>();
        Map<String, Integer> wardPoints = new TreeMap<>();

        for (User u : store.getUsers().values()) {
            if (!u.municipalityId.equals(municipalityId) || !User.RESIDENT.equals(u.role)) continue;
            residents.add(u);
            wardPoints.merge(u.ward, u.points, Integer::sum);
        }
        for (Ping p : store.getPings()) {
            if (p.municipalityId.equals(municipalityId) && Ping.COLLECTED.equals(p.status))
                genuine.merge(p.reporter, 1, Integer::sum);
        }
        residents.sort((a, b) -> a.points != b.points ? b.points - a.points : a.nickname.compareToIgnoreCase(b.nickname));

        List<Map<String, Object>> residentList = new ArrayList<>();
        int rank = 0;
        for (User u : residents) {
            if (u.points <= 0) continue;
            if (++rank > 10) break;
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("rank", rank);
            entry.put("username", u.username);
            entry.put("nickname", u.nickname);
            entry.put("ward", u.ward);
            entry.put("points", u.points);
            entry.put("genuine", genuine.getOrDefault(u.username, 0));
            residentList.add(entry);
        }

        List<Map<String, Object>> wardList = new ArrayList<>();
        wardPoints.entrySet().stream()
                .sorted((a, b) -> b.getValue() - a.getValue())
                .forEach(e -> {
                    Map<String, Object> w = new LinkedHashMap<>();
                    w.put("ward", e.getKey());
                    w.put("points", e.getValue());
                    wardList.add(w);
                });

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("residents", residentList);
        result.put("wards", wardList);
        return result;
    }

    private int intVal(Map<String, Object> m, String k, int def) {
        try {
            Object v = m.get(k);
            if (v == null) return def;
            return Integer.parseInt(String.valueOf(v));
        } catch (Exception e) {
            return def;
        }
    }

    private double doubleVal(Map<String, Object> m, String k, double def) {
        try {
            Object v = m.get(k);
            if (v == null) return def;
            return Double.parseDouble(String.valueOf(v));
        } catch (Exception e) {
            return def;
        }
    }
}
