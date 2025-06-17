package com.d1nvan.jdeepwiki.util;

public class TaskIdGenerator {
    public static String generate() {
        return "TASK_" + System.currentTimeMillis();
    }
}