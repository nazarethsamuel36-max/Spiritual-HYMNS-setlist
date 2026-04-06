package com.worship.util;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Database connection utility using HikariCP for connection pooling.
 * Bug #1: Externalized credentials via Environment Variables.
 * Bug #20: Implemented connection pooling to prevent "Too many connections" errors.
 */
public class DBConnection {

    private static final HikariDataSource dataSource;

    static {
        // Bug #1: Use environment variables, with defaults to avoid immediate breakage
        String dbUrl = System.getenv("DB_URL");
        if (dbUrl == null) dbUrl = "jdbc:mysql://localhost:3306/worship_db?useUnicode=true&characterEncoding=UTF-8&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        
        String dbUser = System.getenv("DB_USER");
        if (dbUser == null) dbUser = "root";
        
        String dbPass = System.getenv("DB_PASSWORD");
        if (dbPass == null) dbPass = "root123";

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(dbUrl);
        config.setUsername(dbUser);
        config.setPassword(dbPass);
        
        // Performance optimizations for MySQL
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("useServerPrepStmts", "true");
        
        // Pool settings
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setConnectionTimeout(30000);
        
        dataSource = new HikariDataSource(config);
    }

    /**
     * Get a connection from the pool.
     * Bug #20 fix: No longer creates a new connection every time.
     */
    public static Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    /**
     * Close a connection safely (returns it to the pool).
     */
    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    
    /**
     * Shutdown the pool.
     */
    public static void shutdown() {
        if (dataSource != null) {
            dataSource.close();
        }
    }
}
