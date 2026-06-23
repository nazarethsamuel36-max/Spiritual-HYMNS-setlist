<%@ page import="java.sql.*, com.worship.util.DBConnection" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html><body class="p-8">
<%
    try (Connection conn = DBConnection.getConnection();
         Statement stmt = conn.createStatement();
         ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM songs")) {
        if (rs.next()) {
            out.print("<h1 class='text-2xl'>Total Songs in Database: <span id='count'>" + rs.getInt(1) + "</span></h1>");
        }
    } catch (Exception e) {
        out.print("Error: " + e.getMessage());
    }
%>
</body></html>
