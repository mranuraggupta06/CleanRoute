package com.cleanroute.model;

public class User {
    public static final String DISPATCHER = "dispatcher";
    public static final String RESIDENT = "resident";

    public String username;
    public String salt;
    public String hash;
    public String role;
    public String municipalityId;
    public String householdId;
    public String nickname;
    public String ward;
    public int points;
    public int strikes;

    public User(String username, String salt, String hash, String role, String municipalityId,
                String householdId, String nickname, String ward, int points, int strikes) {
        this.username = username;
        this.salt = salt;
        this.hash = hash;
        this.role = role;
        this.municipalityId = municipalityId;
        this.householdId = householdId;
        this.nickname = nickname;
        this.ward = ward;
        this.points = points;
        this.strikes = strikes;
    }
}
