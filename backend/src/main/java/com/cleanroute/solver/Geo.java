package com.cleanroute.solver;

public class Geo {
    private static final double EARTH_RADIUS_KM = 6371.0;

    public static double[] homeOf(String householdId, double depotLat, double depotLng, double radiusKm) {
        int h = householdId.toUpperCase().hashCode() * 0x9E3779B1;
        double a = ((h >>> 3) % 3600) / 3600.0 * 2 * Math.PI;
        double r = (0.25 + ((h >>> 15) % 1000) / 1000.0 * 0.6) * Math.min(radiusKm, 1.6);
        double dLat = r / 111.0 * Math.sin(a);
        double dLng = r / (111.0 * Math.cos(Math.toRadians(depotLat))) * Math.cos(a);
        return new double[]{depotLat + dLat, depotLng + dLng};
    }

    public static double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
    }
}
