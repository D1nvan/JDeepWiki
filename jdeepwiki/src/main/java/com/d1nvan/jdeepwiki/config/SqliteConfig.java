package com.d1nvan.jdeepwiki.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import com.alibaba.cloud.ai.memory.jdbc.SQLiteChatMemoryRepository;

@Configuration
public class SqliteConfig {

    @Bean
    public SQLiteChatMemoryRepository sqLiteChatMemoryRepository(){
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.sqlite.JDBC");
        dataSource.setUrl("jdbc:sqlite:data/chat-memory.db"); 
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        return SQLiteChatMemoryRepository.sqliteBuilder()
                .jdbcTemplate(jdbcTemplate).build();
    }

}
