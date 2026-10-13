package com.cleanroute.service;

import com.cleanroute.model.*;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Paths;

@Service
public class SeedService {

    private static final String PASSWORD = "demo123";
    private static final long DAY = 24L * 60 * 60 * 1000;

    public void seed(StoreService store, AuthService auth) {
        synchronized (store) {
            if (store.hasUsers()) return;
            seedGreaterNoida(store, auth);
            seedNoida(store, auth);
            store.saveAll();
        }
    }

    private void seedGreaterNoida(StoreService store, AuthService auth) {
        Municipality m = store.getMunicipality("gn");
        if (m == null) return;
        String[] nicknames = {"GreenGuru", "CleanSweep", "BinBuster", "EcoEka"};
        for (int no = 101; no <= 112; no++) {
            String ward = "Ward " + (1 + (no - 101) % 3);
            boolean active = no <= 104;
            Household h = new Household("GN-" + no, m.id, ward, active ? "" : "DEMO" + no, active);
            store.putHousehold(h);
            if (active) addUser(store, auth, "gn-" + no, User.RESIDENT, m.id, "GN-" + no, nicknames[no - 101], ward);
        }
        addUser(store, auth, "gn-dispatcher", User.DISPATCHER, m.id, "", "GN Control Room", "");

        history(store, m, "gn-101", "large", 0.0006, 0.0010, 6);
        history(store, m, "gn-101", "medium", -0.0012, 0.0004, 4);
        history(store, m, "gn-101", "small", 0.0003, -0.0011, 2);
        history(store, m, "gn-102", "large", -0.0020, -0.0015, 5);
        history(store, m, "gn-103", "medium", 0.0015, -0.0020, 3);
    }

    private void seedNoida(StoreService store, AuthService auth) {
        Municipality m = store.getMunicipality("noida");
        if (m == null) return;
        for (int no = 201; no <= 206; no++) {
            String ward = "Ward " + (1 + (no - 201) % 2);
            boolean active = no == 201;
            Household h = new Household("NOIDA-" + no, m.id, ward, active ? "" : "DEMO" + no, active);
            store.putHousehold(h);
            if (active) addUser(store, auth, "noida-" + no, User.RESIDENT, m.id, "NOIDA-" + no, "NoidaNeat", ward);
        }
        addUser(store, auth, "noida-dispatcher", User.DISPATCHER, m.id, "", "Noida Control Room", "");
        history(store, m, "noida-201", "medium", 0.0010, 0.0008, 3);
    }

    private void addUser(StoreService store, AuthService auth, String username, String role,
                          String munId, String householdId, String nickname, String ward) {
        String salt = auth.newSalt();
        User u = new User(username, salt, auth.hash(PASSWORD, salt), role, munId, householdId, nickname, ward, 0, 0);
        store.putUser(u);
    }

    private void history(StoreService store, Municipality m, String reporter, String size,
                          double dLat, double dLng, int daysAgo) {
        long when = System.currentTimeMillis() - daysAgo * DAY;
        Ping p = new Ping(store.newPingId(), m.id, reporter, m.lat + dLat, m.lng + dLng, size, "", Ping.COLLECTED, when);
        p.resolvedAt = when + 6 * 60 * 60 * 1000;
        store.addPing(p);
        User u = store.getUser(reporter.toLowerCase());
        if (u != null) u.points += Ping.sizePoints(size);
    }
}
