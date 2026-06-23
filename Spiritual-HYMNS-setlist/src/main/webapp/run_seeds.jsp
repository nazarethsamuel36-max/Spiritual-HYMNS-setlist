<%@ page import="java.sql.*, java.io.*, java.util.*, com.worship.util.DBConnection" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <title>Database Seeding Utility</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold mb-4">Worship Library - Database Seeder</h1>
        
        <%
            String[] seedFiles = {
                "d:/worship-song-library/src/main/resources/sql/seed_hymns.sql",
                "d:/worship-song-library/src/main/resources/sql/seed_contemporary1.sql",
                "d:/worship-song-library/src/main/resources/sql/seed_contemporary2.sql",
                "d:/worship-song-library/src/main/resources/sql/seed_christmas.sql",
                "d:/worship-song-library/src/main/resources/sql/seed_easter_final.sql",
                "d:/worship-song-library/src/main/resources/sql/seed_hindi_100.sql",
                "d:/worship-song-library/src/main/resources/sql/seed_marathi_100.sql"
            };

            int totalSuccess = 0;
            int totalErrors = 0;
            StringBuilder log = new StringBuilder();

            try (Connection conn = DBConnection.getConnection()) {
                conn.setAutoCommit(false);
                Statement stmt = conn.createStatement();
                
                for (String filePath : seedFiles) {
                    File file = new File(filePath);
                    if (!file.exists()) {
                        log.append("<p class='text-red-500'>File missing: " + filePath + "</p>");
                        continue;
                    }

                    log.append("<h2 class='font-semibold mt-4 text-blue-600'>Processing: " + file.getName() + "</h2>");
                    
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(file), "UTF-8"))) {
                        StringBuilder currentStatement = new StringBuilder();
                        String line;
                        while ((line = reader.readLine()) != null) {
                            if (line.trim().isEmpty() || line.trim().startsWith("--")) continue;
                            
                            currentStatement.append(line).append("\n");
                            if (line.trim().endsWith(";")) {
                                try {
                                    String sql = currentStatement.toString().trim();
                                    // Remove trailing semicolon for execute
                                    if (sql.endsWith(";")) sql = sql.substring(0, sql.length() - 1);
                                    
                                    stmt.execute(sql);
                                    totalSuccess++;
                                    currentStatement.setLength(0);
                                } catch (SQLException e) {
                                    totalErrors++;
                                    log.append("<p class='text-xs text-red-500'>Error in " + file.getName() + ": " + e.getMessage() + "</p>");
                                    currentStatement.setLength(0);
                                }
                            }
                        }
                    }
                    conn.commit();
                    log.append("<p class='text-green-600 text-sm'>Completed " + file.getName() + "</p>");
                }
            } catch (Exception e) {
                log.append("<p class='text-red-700 font-bold'>CRITICAL ERROR: " + e.getMessage() + "</p>");
            }
        %>

        <div class="mt-6 p-4 bg-gray-100 rounded">
            <h3 class="font-bold">Summary</h3>
            <p>Total successful statements: <span class="text-green-600"><%= totalSuccess %></span></p>
            <p>Total errors: <span class="text-red-600"><%= totalErrors %></span></p>
        </div>

        <div class="mt-8">
            <h3 class="font-bold mb-2">Detailed Log</h3>
            <div class="text-sm space-y-1 bg-gray-50 p-4 border rounded overflow-auto max-h-96">
                <%= log.toString() %>
            </div>
        </div>

        <div class="mt-6">
            <a href="songs" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Back to Song Library</a>
        </div>
    </div>
</body>
</html>
