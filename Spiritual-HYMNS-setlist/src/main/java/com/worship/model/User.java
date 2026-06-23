package com.worship.model;

import java.sql.Timestamp;

/**
 * User model representing the users table.
 * Roles: guest (session only), user (logged in), admin (full access).
 */
public class User {

    private int id;
    private String username;
    private String email;
    private String password;
    private String role; // guest, user, admin
    private String churchName;
    private String instrument;
    private String defaultKey;
    private Timestamp createdAt;

    public User() {
        this.role = "user";
    }

    // Getters and Setters

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getChurchName() { return churchName; }
    public void setChurchName(String churchName) { this.churchName = churchName; }

    public String getInstrument() { return instrument; }
    public void setInstrument(String instrument) { this.instrument = instrument; }

    public String getDefaultKey() { return defaultKey; }
    public void setDefaultKey(String defaultKey) { this.defaultKey = defaultKey; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
