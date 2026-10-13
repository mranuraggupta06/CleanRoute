package com.cleanroute.model;

public class Bin {
    public int id;
    public String name;
    public double lat;
    public double lng;
    public int fill;      // 0-100 percent
    public double fixedKg = -1; // -1 means use fill level

    public Bin(int id, String name, double lat, double lng, int fill) {
        this.id = id;
        this.name = name;
        this.lat = lat;
        this.lng = lng;
        this.fill = fill;
    }

    public double loadKg(double binCapacityKg) {
        if (fixedKg >= 0) return fixedKg;
        return fill / 100.0 * binCapacityKg;
    }
}
