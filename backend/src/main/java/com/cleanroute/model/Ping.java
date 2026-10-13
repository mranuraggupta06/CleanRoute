package com.cleanroute.model;

import java.util.ArrayList;
import java.util.List;

public class Ping {
    public static final String PENDING = "PENDING";
    public static final String VERIFIED = "VERIFIED";
    public static final String REJECTED = "REJECTED";
    public static final String COLLECTED = "COLLECTED";
    public static final String FALSE_REPORT = "FALSE_REPORT";

    public static final String[] SIZES = {"small", "medium", "large", "massive"};
    private static final int[] SIZE_KG = {10, 40, 150, 400};
    private static final int[] SIZE_POINTS = {5, 10, 20, 30};

    public static final String[] KINDS = {
        "Household garbage", "Overflowing bin", "Garden waste",
        "Construction debris", "Dead animal or hazardous", "Other"
    };

    public int id;
    public String municipalityId;
    public String reporter;
    public double lat;
    public double lng;
    public String size;
    public String note;
    public String status;
    public String kind = "Household garbage";
    public boolean hasPhoto;
    public long createdAt;
    public long resolvedAt;
    public List<String> supporters = new ArrayList<>();

    public Ping(int id, String municipalityId, String reporter, double lat, double lng,
                String size, String note, String status, long createdAt) {
        this.id = id;
        this.municipalityId = municipalityId;
        this.reporter = reporter;
        this.lat = lat;
        this.lng = lng;
        this.size = size;
        this.note = note;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static boolean validSize(String size) { return indexOf(size) >= 0; }
    public static int sizeKg(String s) { return SIZE_KG[indexOf(s)]; }
    public static int sizePoints(String s) { return SIZE_POINTS[indexOf(s)]; }
    private static int indexOf(String size) {
        for (int i = 0; i < SIZES.length; i++) if (SIZES[i].equals(size)) return i;
        return -1;
    }
    public static boolean validKind(String kind) {
        for (String k : KINDS) if (k.equals(kind)) return true;
        return false;
    }
    public static boolean isOpen(String status) {
        return PENDING.equals(status) || VERIFIED.equals(status);
    }
}
