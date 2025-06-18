package com.d1nvan.jdeepwiki.model.vo;

import java.util.List;

import lombok.Data;

@Data
public class CatalogueListVo {
    private String catalogueId;
    private String parentCatalogueId;
    private String name;
    private String title;
    private String prompt;
    private String dependentFile;
    private List<CatalogueListVo> children;
    private String content;
    private Integer status;
}
