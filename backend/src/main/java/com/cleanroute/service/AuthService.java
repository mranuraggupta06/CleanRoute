package com.cleanroute.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class AuthService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    private final Map<String, Queue<Long>> failures = new ConcurrentHashMap<>();
    private static final int MAX_FAILURES = 5;
    private static final long WINDOW_MS = 5 * 60 * 1000;

    public String createToken(String username, String role) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(key)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public String newSalt() {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    public String hash(String password, String saltB64) {
        try {
            byte[] salt = Base64.getDecoder().decode(saltB64);
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 256);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = factory.generateSecret(spec).getEncoded();
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Hashing failed", e);
        }
    }

    public boolean matches(String password, String saltB64, String expectedHash) {
        return hash(password, saltB64).equals(expectedHash);
    }

    public boolean isLocked(String key) {
        Queue<Long> times = failures.get(key);
        if (times == null) return false;
        long cutoff = System.currentTimeMillis() - WINDOW_MS;
        times.removeIf(t -> t < cutoff);
        return times.size() >= MAX_FAILURES;
    }

    public void recordFailure(String key) {
        failures.computeIfAbsent(key, k -> new ConcurrentLinkedQueue<>()).add(System.currentTimeMillis());
    }

    public void clearFailures(String key) {
        failures.remove(key);
    }
}
