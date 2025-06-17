package com.d1nvan.jdeepwiki.model.dto;

import java.util.List;

import lombok.Data;

@Data
public class CatalogueStruct {
    private List<Item> items;

    @Data
    public static class Item {
        private String title;
        private String name;
        private List<String> dependent_file;
        private String prompt;
        private List<children> children;
    }

    @Data
    public static class children {
        private String title;
        private String name;
        private List<String> dependent_file;
        private String prompt;

    }
}