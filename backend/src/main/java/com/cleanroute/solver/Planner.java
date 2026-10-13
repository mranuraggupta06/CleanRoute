package com.cleanroute.solver;

import com.cleanroute.model.Bin;
import com.cleanroute.model.Ping;
import com.cleanroute.service.StoreService;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class Planner {

    public static final double TRUCK_KMH = 30;
    public static final double MINUTES_PER_STOP = 4;

    public Map<String, Object> optimize(StoreService store, String municipalityId, int threshold,
                                         double truckCapacity, double binCapacity, int fleet,
                                         boolean includePending) {
        synchronized (store) {
            Bin depot = store.getDepotOf(municipalityId);
            List<Bin> bins = store.getBinsOf(municipalityId);

            List<Bin> reportStops = new ArrayList<>();
            for (Ping p : store.getPings()) {
                if (p.municipalityId.equals(municipalityId)
                        && (Ping.VERIFIED.equals(p.status) || (includePending && Ping.PENDING.equals(p.status)))) {
                    Bin b = new Bin(p.id, "Report #" + p.id, p.lat, p.lng, 0);
                    b.fixedKg = Ping.sizeKg(p.size);
                    reportStops.add(b);
                }
            }

            List<Bin> selected = new ArrayList<>();
            for (Bin b : bins) if (b.fill >= threshold) selected.add(b);
            int binCount = selected.size();
            selected.addAll(reportStops);

            List<Bin> everything = new ArrayList<>(bins);
            everything.addAll(reportStops);
            Solver.Problem all = new Solver.Problem(depot, everything, binCapacity);
            Solver.Result baseline = Solver.run(
                "Visit Every Bin",
                "Visit Every Bin (Current Habit)",
                "Sends trucks to every single bin in town regardless of whether it is full or empty.",
                "Baseline",
                all, truckCapacity, false, false
            );

            List<Solver.Result> results = new ArrayList<>();
            Solver.Problem problem = null;
            if (!selected.isEmpty()) {
                problem = new Solver.Problem(depot, selected, binCapacity);
                results.add(Solver.run(
                    "Nearest Neighbour",
                    "Quick & Direct",
                    "Drives to the closest overflowing bin one-by-one until the truck is full. Fast to plan.",
                    "Fastest",
                    problem, truckCapacity, false, false
                ));
                results.add(Solver.run(
                    "Nearest Neighbour + 2-opt",
                    "Quick & Cleaned",
                    "Takes closest bins first, then automatically fixes crossing paths to prevent backtracking.",
                    "No Loops",
                    problem, truckCapacity, false, true
                ));
                results.add(Solver.run(
                    "Clarke-Wright Savings",
                    "Smart Cluster Merger",
                    "Calculates travel savings to pair nearby bins together into efficient collection loops.",
                    "Clustered",
                    problem, truckCapacity, true, false
                ));
                results.add(Solver.run(
                    "Clarke-Wright + 2-opt",
                    "Optimal Eco-Route ⭐",
                    "Combines smart cluster pairing with loop-untangling. Minimum distance, fuel, and truck wear.",
                    "Recommended",
                    problem, truckCapacity, true, true
                ));
            }

            int best = -1;
            for (int i = 0; i < results.size(); i++)
                if (best == -1 || results.get(i).distanceKm < results.get(best).distanceKm - 1e-9) best = i;

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("threshold", threshold);
            response.put("totalBins", bins.size());
            response.put("selectedBins", binCount);
            response.put("reportStops", reportStops.size());
            response.put("truckCapacity", truckCapacity);
            response.put("fleet", fleet);
            response.put("includePending", includePending);
            response.put("truckKmh", TRUCK_KMH);
            response.put("minutesPerStop", MINUTES_PER_STOP);
            response.put("baseline", resultToMap(all, baseline, baseline.distanceKm));

            List<Map<String, Object>> resultMaps = new ArrayList<>();
            for (Solver.Result r : results)
                resultMaps.add(resultToMap(problem, r, baseline.distanceKm));
            response.put("results", resultMaps);
            response.put("bestIndex", best);

            String warning = "";
            if (best >= 0 && results.get(best).routes.size() > fleet)
                warning = "The best plan needs " + results.get(best).routes.size() + " trucks but the fleet has " + fleet + ". Increase truck capacity or fleet size.";
            else if (selected.isEmpty())
                warning = "No bin is at or above " + threshold + "% full and no verified reports are waiting. Lower the threshold or simulate new fill levels.";
            response.put("warning", warning);
            return response;
        }
    }

    public Map<String, Object> dispatch(StoreService store, String municipalityId, int threshold,
                                         double truckCapacity, double binCapacity, int fleet, int algorithmIndex) {
        synchronized (store) {
            Bin depot = store.getDepotOf(municipalityId);
            List<Bin> bins = store.getBinsOf(municipalityId);
            List<Bin> selected = new ArrayList<>();
            for (Bin b : bins) if (b.fill >= threshold) selected.add(b);
            for (Ping p : store.getPings()) {
                if (p.municipalityId.equals(municipalityId) && Ping.VERIFIED.equals(p.status)) {
                    Bin b = new Bin(p.id, "Report #" + p.id, p.lat, p.lng, 0);
                    b.fixedKg = Ping.sizeKg(p.size);
                    selected.add(b);
                }
            }
            if (selected.isEmpty())
                throw new RuntimeException("Nothing to collect. Lower the threshold or verify some reports first.");

            Solver.Problem problem = new Solver.Problem(depot, selected, binCapacity);
            List<Solver.Result> results = new ArrayList<>();
            results.add(Solver.run("Nearest Neighbour", "Quick & Direct", "Drives to nearest bin first.", "Fastest", problem, truckCapacity, false, false));
            results.add(Solver.run("Nearest Neighbour + 2-opt", "Quick & Cleaned", "Closest bins, uncrossed paths.", "No Loops", problem, truckCapacity, false, true));
            results.add(Solver.run("Clarke-Wright Savings", "Smart Cluster Merger", "Pairs bins with greatest travel savings.", "Clustered", problem, truckCapacity, true, false));
            results.add(Solver.run("Clarke-Wright + 2-opt", "Optimal Eco-Route ⭐", "Shortest mileage and minimum fuel.", "Recommended", problem, truckCapacity, true, true));

            int best = 0;
            for (int i = 1; i < results.size(); i++)
                if (results.get(i).distanceKm < results.get(best).distanceKm - 1e-9) best = i;

            int pick = (algorithmIndex >= 0 && algorithmIndex < results.size()) ? algorithmIndex : best;
            Solver.Result r = results.get(pick);
            if (r.routes.size() > fleet)
                throw new RuntimeException("This plan needs " + r.routes.size() + " trucks but only " + fleet + " available.");

            Map<Integer, Bin> byId = new HashMap<>();
            for (Bin b : selected) byId.put(b.id, b);

            List<Map<String, Object>> routeList = new ArrayList<>();
            for (int i = 0; i < r.routes.size(); i++) {
                List<Integer> route = r.routes.get(i);
                List<Map<String, Object>> stops = new ArrayList<>();
                for (int k : route) {
                    Bin b = byId.get(problem.binId[k]);
                    Map<String, Object> stop = new LinkedHashMap<>();
                    stop.put("name", b.name);
                    stop.put("lat", b.lat);
                    stop.put("lng", b.lng);
                    stops.add(stop);
                }
                Map<String, Object> routeMap = new LinkedHashMap<>();
                routeMap.put("truck", i + 1);
                routeMap.put("distanceKm", Math.round(Solver.routeLength(problem, route) * 100.0) / 100.0);
                routeMap.put("loadKg", Math.round(Solver.routeLoad(problem, route)));
                routeMap.put("stops", stops);
                routeList.add(routeMap);
            }

            Map<String, Object> dispatchResult = new LinkedHashMap<>();
            dispatchResult.put("startedAt", System.currentTimeMillis());
            dispatchResult.put("algorithm", r.friendlyName);
            dispatchResult.put("speedKmh", TRUCK_KMH);
            dispatchResult.put("totalKm", Math.round(r.distanceKm * 100.0) / 100.0);
            dispatchResult.put("routes", routeList);

            store.setDispatch(municipalityId, dispatchResult);
            return dispatchResult;
        }
    }

    private Map<String, Object> resultToMap(Solver.Problem p, Solver.Result r, double baselineKm) {
        double saving = baselineKm > 0 ? (baselineKm - r.distanceKm) / baselineKm * 100.0 : 0;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", r.name);
        m.put("friendlyName", r.friendlyName);
        m.put("description", r.description);
        m.put("tag", r.tag);
        m.put("distanceKm", Math.round(r.distanceKm * 100.0) / 100.0);
        m.put("savingPercent", Math.round(saving * 10.0) / 10.0);
        m.put("vehicles", r.routes.size());
        m.put("timeMs", r.timeMicros / 1000.0);

        List<Map<String, Object>> routeList = new ArrayList<>();
        if (p != null) {
            for (List<Integer> route : r.routes) {
                Map<String, Object> rm = new LinkedHashMap<>();
                List<Integer> stopIds = new ArrayList<>();
                for (int node : route) stopIds.add(p.binId[node]);
                rm.put("stopIds", stopIds);
                rm.put("distanceKm", Math.round(Solver.routeLength(p, route) * 100.0) / 100.0);
                rm.put("loadKg", Math.round(Solver.routeLoad(p, route)));
                routeList.add(rm);
            }
        }
        m.put("routes", routeList);
        return m;
    }
}
