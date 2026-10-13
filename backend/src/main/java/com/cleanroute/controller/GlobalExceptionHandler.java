package com.cleanroute.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException e) {
        String msg = e.getMessage();
        int status = 400;
        if (msg != null) {
            if (msg.contains("sign in")) status = 401;
            else if (msg.contains("can do that") || msg.contains("Only")) status = 403;
            else if (msg.toLowerCase().contains("not found")) status = 404;
            else if (msg.contains("Too many") || msg.contains("used all")) status = 429;
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", msg != null ? msg : "An unexpected error occurred.");
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception e) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Server error: " + e.getMessage());
        return ResponseEntity.status(500).body(body);
    }
}
