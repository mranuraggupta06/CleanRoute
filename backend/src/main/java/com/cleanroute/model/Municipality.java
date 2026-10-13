package com.cleanroute.model;

public class Municipality {
    public String id;
    public String name;
    public double radiusKm;
    public double lat;
    public double lng;

    public Municipality(String id, String name, double radiusKm) {
        this.id = id;
        this.name = name;
        this.radiusKm = radiusKm;
    }

    public String prefix() {
        return id.toUpperCase();
    }
}
