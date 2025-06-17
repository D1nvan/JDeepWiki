package com.d1nvan.jdeepwiki.model.entity;

import java.time.LocalDateTime;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import lombok.Data;

@Data
@TableName("Catalogue")
public class Catalogue {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String taskId;

    private String catalogueId;

    private String parentCatalogueId;

    private String name;

    private String title;
    
    private String prompt;
    
    private String dependentFile;
    
    private String children;
    
    private String content;

    private Integer status;
    
    private String failReason;
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;

}