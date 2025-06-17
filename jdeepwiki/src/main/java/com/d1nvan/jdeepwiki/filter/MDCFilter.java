package com.d1nvan.jdeepwiki.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.MDC;

import com.baomidou.mybatisplus.core.toolkit.StringUtils;

import cn.hutool.core.lang.UUID;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@WebFilter(filterName = "MDCFilter",urlPatterns = "/*")
public class MDCFilter implements Filter{

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        boolean hasTraceId = StringUtils.isNotBlank(MDC.get("traceId"));
        try {
            if (!hasTraceId) {
                String traceId = UUID.randomUUID().toString(true);
                MDC.put("traceId", traceId);
            }
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("traceId");
        }
    }
}
