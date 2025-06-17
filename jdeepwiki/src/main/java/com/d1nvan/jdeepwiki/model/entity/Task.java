package com.d1nvan.jdeepwiki.model.entity;

import java.time.LocalDateTime;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.d1nvan.jdeepwiki.enums.TaskStatusEnum;

import lombok.Data;

@Data
@TableName("task")
public class Task {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String taskId;
    
    private String projectName;
    
    private String projectUrl;
    
    private String userName;
    
    private TaskStatusEnum status;
    
    private String failReason;
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;

}