package com.d1nvan.jdeepwiki.context;

import com.d1nvan.jdeepwiki.model.entity.Task;
import com.d1nvan.jdeepwiki.model.params.CreateTaskParams;

import lombok.Data;

@Data
public class ExecutionContext {
    
    private String taskId;

    private Task task;

    private CreateTaskParams createParams;

    private String localPath;
}
