package com.d1nvan.jdeepwiki.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;


@Configuration
@Slf4j
public class ThreadPoolConfig {

    /** 核心线程数：操作系统线程数+2 */
    private static final int CORE_POOL_SIZE = Runtime.getRuntime().availableProcessors() + 2;
    /** 最大线程数 */
    private static final int MAX_POOL_SIZE = CORE_POOL_SIZE * 2;
    /** 队列长度 */
    private static final int QUEUE_CAPACITY = 10000;

    @Bean
    public MdcTaskDecorator taskDecorator() {
        return new MdcTaskDecorator();
    }

    /**
     * 异步执行生成任务线程池
     */
    @Bean(name = "CreateTaskExecutor")
    public ThreadPoolTaskExecutor createTaskExecutor(MdcTaskDecorator taskDecorator) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("CreateTaskExcutor-");
        executor.setTaskDecorator(taskDecorator);
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.initialize();
        return executor;
    }

    /**
     * 异步生成目录详情线程池
     */
    @Bean(name = "GenCatalogueDetailExcutor")
    public ThreadPoolTaskExecutor genCatalogueDetailExcutor(MdcTaskDecorator taskDecorator) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(CORE_POOL_SIZE);
        executor.setMaxPoolSize(MAX_POOL_SIZE);
        executor.setQueueCapacity(QUEUE_CAPACITY);
        executor.setThreadNamePrefix("GenCatalogueDetailExcutor-");
        executor.setTaskDecorator(taskDecorator);
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.initialize();
        return executor;
    }
}
