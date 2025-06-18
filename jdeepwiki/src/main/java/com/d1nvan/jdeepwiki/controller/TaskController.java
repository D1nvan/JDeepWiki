package com.d1nvan.jdeepwiki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.d1nvan.jdeepwiki.model.R;
import com.d1nvan.jdeepwiki.model.entity.Catalogue;
import com.d1nvan.jdeepwiki.model.entity.Task;
import com.d1nvan.jdeepwiki.model.params.CreateTaskParams;
import com.d1nvan.jdeepwiki.model.params.ListPageParams;
import com.d1nvan.jdeepwiki.model.vo.CatalogueListVo;
import com.d1nvan.jdeepwiki.model.vo.Result;
import com.d1nvan.jdeepwiki.model.vo.TaskVo;
import com.d1nvan.jdeepwiki.service.CatalogueService;
import com.d1nvan.jdeepwiki.service.TaskService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/task")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private CatalogueService catalogueService;

    @PostMapping("/create/git")
    public Result<TaskVo> createFromGit(@RequestBody CreateTaskParams params) {
        return Result.success(taskService.createFromGit(params));
    }

    @PostMapping("/create/zip")
    public Result<TaskVo> createFromZip(
            @RequestPart("file") MultipartFile file,
            @RequestParam("projectName") String projectName,
            @RequestParam("userName") String userName) {
        log.info("接收到ZIP文件上传请求，文件名: {}, 大小: {} bytes, 项目名: {}, 用户名: {}", 
            file.getOriginalFilename(), file.getSize(), projectName, userName);
            
        CreateTaskParams params = new CreateTaskParams();
        params.setProjectName(projectName);
        params.setUserName(userName);
        params.setSourceType("zip");
        return Result.success(taskService.createFromZip(params, file));
    }

    @PostMapping("/listPage")
    public R<Page<Task>> getTasksByPage(@RequestBody ListPageParams params) {
        Page<Task> page = taskService.getPageList(params);
        return R.success(page);
    }

    @GetMapping("/detail")
    public R<Task> getTaskByTaskId(@RequestParam String taskId) {
        return R.success(taskService.getTaskByTaskId(taskId));
    }

    @PutMapping("/update")
    public R<Task> updateTask(@RequestBody TaskVo task) {
        return R.success(taskService.updateTaskByTaskId(task));
    }

    @GetMapping("/delete")
    public R<Void> deleteTask(@RequestParam String taskId) {
        taskService.deleteTaskByTaskId(taskId);
        return R.success();
    }

    @GetMapping("/catalogue/detail")
    public R<List<Catalogue>> getCatalogueDetail(@RequestParam String taskId) {
        return R.success(catalogueService.getCatalogueByTaskId(taskId));
    }

    @GetMapping("/catalogue/tree")
    public R<List<CatalogueListVo>> getCatalogueTree(@RequestParam String taskId) {
        return R.success(catalogueService.getCatalogueTreeByTaskId(taskId));
    }

}