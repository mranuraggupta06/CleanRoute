package com.cleanroute.solver;

import com.cleanroute.model.Bin;
import java.util.*;

/**
 * The routing algorithms for the Capacitated Vehicle Routing Problem (CVRP).
 * Node 0 = depot, nodes 1..n = bins.
 */
public class Solver {

    public static class Problem {
        public final int n;
        public final double[][] dist;
        public final double[] demand;
        public final int[] binId;

        public Problem(Bin depot, List<Bin> bins, double binCapacityKg) {
            this.n = bins.size();
            this.dist = new double[n + 1][n + 1];
            this.demand = new double[n + 1];
            this.binId = new int[n + 1];

            Bin[] nodes = new Bin[n + 1];
            nodes[0] = depot;
            for (int i = 0; i < n; i++) nodes[i + 1] = bins.get(i);

            for (int i = 0; i <= n; i++) {
                binId[i] = nodes[i].id;
                demand[i] = (i == 0) ? 0 : nodes[i].loadKg(binCapacityKg);
                for (int j = 0; j <= n; j++)
                    dist[i][j] = Geo.haversineKm(nodes[i].lat, nodes[i].lng, nodes[j].lat, nodes[j].lng);
            }
        }
    }

    public static class Result {
        public final String name;
        public final String friendlyName;
        public final String description;
        public final String tag;
        public final List<List<Integer>> routes;
        public final double distanceKm;
        public final long timeMicros;

        public Result(String name, String friendlyName, String description, String tag,
                      List<List<Integer>> routes, double distanceKm, long timeMicros) {
            this.name = name;
            this.friendlyName = friendlyName;
            this.description = description;
            this.tag = tag;
            this.routes = routes;
            this.distanceKm = distanceKm;
            this.timeMicros = timeMicros;
        }
    }

    public static double routeLength(Problem p, List<Integer> route) {
        if (route.isEmpty()) return 0;
        double len = p.dist[0][route.get(0)];
        for (int i = 0; i + 1 < route.size(); i++)
            len += p.dist[route.get(i)][route.get(i + 1)];
        len += p.dist[route.get(route.size() - 1)][0];
        return len;
    }

    public static double totalLength(Problem p, List<List<Integer>> routes) {
        double total = 0;
        for (List<Integer> r : routes) total += routeLength(p, r);
        return total;
    }

    public static double routeLoad(Problem p, List<Integer> route) {
        double load = 0;
        for (int node : route) load += p.demand[node];
        return load;
    }

    // 1. Nearest Neighbour - Greedy
    public static List<List<Integer>> nearestNeighbour(Problem p, double capacity) {
        boolean[] visited = new boolean[p.n + 1];
        int remaining = p.n;
        List<List<Integer>> routes = new ArrayList<>();

        while (remaining > 0) {
            List<Integer> route = new ArrayList<>();
            double load = 0;
            int current = 0;

            while (true) {
                int best = -1;
                double bestDist = Double.MAX_VALUE;
                for (int j = 1; j <= p.n; j++) {
                    if (visited[j]) continue;
                    boolean fits = load + p.demand[j] <= capacity;
                    if (!fits && !route.isEmpty()) continue;
                    if (p.dist[current][j] < bestDist) {
                        bestDist = p.dist[current][j];
                        best = j;
                    }
                }
                if (best == -1) break;
                visited[best] = true;
                remaining--;
                route.add(best);
                load += p.demand[best];
                current = best;
            }
            routes.add(route);
        }
        return routes;
    }

    private static class Route {
        List<Integer> nodes = new ArrayList<>();
        double load;
    }

    // 2. Clarke-Wright Savings
    public static List<List<Integer>> clarkeWright(Problem p, double capacity) {
        int n = p.n;
        Route[] routeOf = new Route[n + 1];
        for (int i = 1; i <= n; i++) {
            Route r = new Route();
            r.nodes.add(i);
            r.load = p.demand[i];
            routeOf[i] = r;
        }

        List<double[]> savings = new ArrayList<>();
        for (int i = 1; i <= n; i++)
            for (int j = i + 1; j <= n; j++)
                savings.add(new double[]{p.dist[0][i] + p.dist[0][j] - p.dist[i][j], i, j});

        savings.sort((a, b) -> Double.compare(b[0], a[0]));

        for (double[] s : savings) {
            int i = (int) s[1], j = (int) s[2];
            Route ri = routeOf[i], rj = routeOf[j];
            if (ri == rj) continue;
            if (ri.load + rj.load > capacity) continue;

            List<Integer> a = ri.nodes, b = rj.nodes;
            List<Integer> merged;
            if (last(a) == i && first(b) == j) merged = concat(a, b);
            else if (last(a) == i && last(b) == j) merged = concat(a, reversed(b));
            else if (first(a) == i && first(b) == j) merged = concat(reversed(a), b);
            else if (first(a) == i && last(b) == j) merged = concat(b, a);
            else continue;

            ri.nodes = merged;
            ri.load += rj.load;
            for (int node : rj.nodes) routeOf[node] = ri;
        }

        Set<Route> unique = new LinkedHashSet<>();
        for (int i = 1; i <= n; i++) unique.add(routeOf[i]);
        List<List<Integer>> routes = new ArrayList<>();
        for (Route r : unique) routes.add(new ArrayList<>(r.nodes));
        return routes;
    }

    private static int first(List<Integer> l) { return l.get(0); }
    private static int last(List<Integer> l) { return l.get(l.size() - 1); }
    private static List<Integer> concat(List<Integer> a, List<Integer> b) {
        List<Integer> out = new ArrayList<>(a); out.addAll(b); return out;
    }
    private static List<Integer> reversed(List<Integer> l) {
        List<Integer> out = new ArrayList<>(l); Collections.reverse(out); return out;
    }

    // 2-opt: uncross loops
    public static void twoOpt(Problem p, List<Integer> route) {
        if (route.size() < 3) return;
        List<Integer> path = new ArrayList<>();
        path.add(0); path.addAll(route); path.add(0);

        boolean improved = true;
        while (improved) {
            improved = false;
            for (int i = 1; i < path.size() - 2; i++) {
                for (int j = i + 1; j < path.size() - 1; j++) {
                    int a = path.get(i - 1), b2 = path.get(i), c = path.get(j), d = path.get(j + 1);
                    double delta = p.dist[a][c] + p.dist[b2][d] - p.dist[a][b2] - p.dist[c][d];
                    if (delta < -1e-9) {
                        Collections.reverse(path.subList(i, j + 1));
                        improved = true;
                    }
                }
            }
        }
        route.clear();
        route.addAll(path.subList(1, path.size() - 1));
    }

    public static Result run(String name, String friendlyName, String description, String tag,
                             Problem p, double capacity, boolean useClarkeWright, boolean useTwoOpt) {
        long start = System.nanoTime();
        List<List<Integer>> routes = useClarkeWright ? clarkeWright(p, capacity) : nearestNeighbour(p, capacity);
        if (useTwoOpt) for (List<Integer> r : routes) twoOpt(p, r);
        long micros = (System.nanoTime() - start) / 1000;
        return new Result(name, friendlyName, description, tag, routes, totalLength(p, routes), micros);
    }
}
