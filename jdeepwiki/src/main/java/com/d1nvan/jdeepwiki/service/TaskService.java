package com.d1nvan.jdeepwiki.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.d1nvan.jdeepwiki.context.ExecutionContext;
import com.d1nvan.jdeepwiki.enums.TaskStatusEnum;
import com.d1nvan.jdeepwiki.mapper.TaskMapper;
import com.d1nvan.jdeepwiki.model.dto.GenCatalogueDTO;
import com.d1nvan.jdeepwiki.model.entity.Task;
import com.d1nvan.jdeepwiki.model.params.CreateTaskParams;
import com.d1nvan.jdeepwiki.model.params.ListPageParams;
import com.d1nvan.jdeepwiki.model.vo.TaskVo;
import com.d1nvan.jdeepwiki.util.TaskIdGenerator;

import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TaskService extends ServiceImpl<TaskMapper, Task> {

    @Resource(name = "CreateTaskExecutor")
    private ThreadPoolTaskExecutor createTaskExecutor;

    @Autowired
    private GitService gitService;

    @Autowired
    private FileService fileService;

    @Autowired
    private CatalogueService catalogueService;

    public Task createTask(CreateTaskParams params, MultipartFile file) {

        // 1.根据项目来源处理本地目录
        String localPath = fileService.getRepositoryPath(params.getUserName(),
                params.getProjectName());

        if ("git".equals(params.getSourceType())) {
            gitService.cloneRepository(params, localPath);
        } else {
            // 解压ZIP文件到项目目录
            fileService.unzipToProjectDir(file, params.getUserName(), params.getProjectName());
        }

        //插入任务
        Task task = insertTask(params);
        
        ExecutionContext context = new ExecutionContext();
        context.setTaskId(task.getTaskId());
        context.setTask(task);
        context.setCreateParams(params);
        context.setLocalPath(localPath);
        // 异步处理任务
        createTaskExecutor.execute(() -> {
            try {
                executeTask(context);
            }catch (Exception e) {
                log.info("任务:{}执行失败:{}", task.getTaskId(), e.getMessage());
                task.setStatus(TaskStatusEnum.FAILED);
                task.setFailReason(e.getMessage());
                task.setUpdateTime(LocalDateTime.now());
                this.updateById(task);
            }
        });

        return task;
    }

    private void executeTask(ExecutionContext context) {
        Task task = context.getTask();
        try{
            // 2.生成项目目录
            String fileTree = fileService.getFileTree(context.getLocalPath());
            GenCatalogueDTO catalogueDTO = catalogueService.generateCatalogue(fileTree, context);

            // 3.生成项目目录 并生成目录详情
            catalogueService.parallelGenerateCatalogueDetail(fileTree, catalogueDTO, context.getLocalPath());
            task.setStatus(TaskStatusEnum.COMPLETED);
            task.setUpdateTime(LocalDateTime.now());
        }catch (Exception e) {
            log.error("任务执行失败", e);
            task.setStatus(TaskStatusEnum.FAILED);
            task.setFailReason(e.getMessage());
            task.setUpdateTime(LocalDateTime.now());
        }finally{
            this.updateById(task);
        }
        
    }
    

    private Task insertTask(CreateTaskParams params) {
        Task task =  new Task();
        task.setTaskId(TaskIdGenerator.generate());
        task.setProjectName(params.getProjectName());
        task.setProjectUrl(params.getProjectUrl());
        task.setUserName(params.getUserName());
        task.setStatus(TaskStatusEnum.IN_PROGRESS);
        task.setCreateTime(LocalDateTime.now());
        task.setUpdateTime(LocalDateTime.now());
        this.save(task);
        return task;
    }

    public Page<Task> getPageList(ListPageParams params) {
        LambdaQueryWrapper<Task> wrapper = new LambdaQueryWrapper<>();
        if (params.getTaskId() != null && !params.getTaskId().isEmpty()) {
            wrapper.eq(Task::getTaskId, params.getTaskId());
        }
        if (params.getProjectName() != null && !params.getProjectName().isEmpty()) {
            wrapper.like(Task::getProjectName, params.getProjectName());
        }
        if (params.getUserName() != null && !params.getUserName().isEmpty()) {
            wrapper.eq(Task::getUserName, params.getUserName());
        }
        return this.page(new Page<>(params.getPageIndex(), params.getPageSize()), wrapper);
    }

    public Task getTaskByTaskId(String taskId) {
        return this.getOne(new LambdaQueryWrapper<Task>().eq(Task::getTaskId, taskId));
    }

    public Task updateTaskByTaskId(TaskVo taskVo) {
        Task task = getTaskByTaskId(taskVo.getTaskId());
        task.setProjectName(taskVo.getProjectName());
        task.setProjectUrl(taskVo.getProjectUrl());
        task.setUserName(taskVo.getUserName());
        task.setUpdateTime(LocalDateTime.now());
        this.updateById(task);
        return task;
    }

    @Transactional
    public void deleteTaskByTaskId(String taskId) {
        Task task = getTaskByTaskId(taskId);
        if (task != null) {
            // 获取任务关联的项目信息
            String projectName = task.getProjectName();
            String userName = task.getUserName();
            try {
                // 先删除项目目录
                fileService.deleteProjectDirectory(userName, projectName);
                log.info("成功删除任务 {} 的项目目录: {}", taskId, projectName);
            } catch (Exception e) {
                log.error("删除任务 {} 的项目目录时出错: {}", taskId, e.getMessage(), e);
                // 即使删除目录失败，也继续删除数据库记录
            }
            
            // 删除任务关联的目录
            catalogueService.deleteCatalogueByTaskId(taskId);

            // 删除数据库记录
            this.removeById(task.getId());
            log.info("成功删除任务记录: {}", taskId);
        } else {
            log.warn("未找到任务ID: {}", taskId);
        }
    }

    public TaskVo createFromGit(CreateTaskParams params) {
        params.setSourceType("git");
        // 处理Git仓库创建任务的逻辑
        Task task = createTask(params, null);
        return TaskVo.fromEntity(task);
    }

    public TaskVo createFromZip(CreateTaskParams params, MultipartFile file) {
        try {
            Task task = createTask(params, file);
            return TaskVo.fromEntity(task);
        } catch (Exception e) {
            log.error("处理ZIP文件失败", e);
            throw new RuntimeException("处理ZIP文件失败: " + e.getMessage());
        }
    }
}