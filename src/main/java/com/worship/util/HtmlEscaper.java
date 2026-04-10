package com.worship.util;

/**
 * Simple HTML escaper to prevent XSS attacks in JSP scriptlet output.
 * Replaces dangerous characters with their HTML entity equivalents.
 */
public class HtmlEscaper {

    /**
     * Escape HTML special characters to prevent XSS.
     * Returns null if input is null.
     */
    public static String escapeHtml(String input) {
        if (input == null) return null;

        StringBuilder sb = new StringBuilder(input.length());
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            switch (c) {
                case '&':  sb.append("&amp;");  break;
                case '<':  sb.append("&lt;");   break;
                case '>':  sb.append("&gt;");   break;
                case '"':  sb.append("&quot;"); break;
                case '\'': sb.append("&#39;");  break;
                default:   sb.append(c);        break;
            }
        }
        return sb.toString();
    }
}
