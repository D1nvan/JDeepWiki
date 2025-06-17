package com.d1nvan.jdeepwiki.model.vo;

import com.d1nvan.jdeepwiki.model.entity.Task;
import lombok.Data;

@Data
public class TaskVo {
    private Long id;
    private String taskId;
    private String projectName;
    private String projectUrl;
    private String userName;
    private Integer status;
    private String failReason;
    private String createTime;
    private String updateTime;

    public static TaskVo fromEntity(Task task) {
        if (task == null) {
            return null;
        }
        TaskVo vo = new TaskVo();
        vo.setId(task.getId());
        vo.setTaskId(task.getTaskId());
        vo.setProjectName(task.getProjectName());
        vo.setProjectUrl(task.getProjectUrl());
        vo.setUserName(task.getUserName());
        vo.setStatus(task.getStatus().getCode());
        vo.setFailReason(task.getFailReason());
        vo.setCreateTime(task.getCreateTime() != null ? task.getCreateTime().toString() : null);
        vo.setUpdateTime(task.getUpdateTime() != null ? task.getUpdateTime().toString() : null);
        return vo;
    }
}
