package com.worship.util;

import jakarta.servlet.*;
import java.io.IOException;

/**
 * Sets UTF-8 character encoding on all requests and responses.
 * Required for Hindi, Marathi, Bengali support.
 */
public class CharacterEncodingFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {}
}
