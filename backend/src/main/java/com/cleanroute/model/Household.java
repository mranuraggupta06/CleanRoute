package com.cleanroute.model;

public class Household {
    public String id;
    public String municipalityId;
    public String ward;
    public String code;
    public boolean activated;

    public Household(String id, String municipalityId, String ward, String code, boolean activated) {
        this.id = id;
        this.municipalityId = municipalityId;
        this.ward = ward;
        this.code = code;
        this.activated = activated;
    }
}
