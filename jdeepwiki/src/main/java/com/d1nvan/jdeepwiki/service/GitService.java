package com.d1nvan.jdeepwiki.service;

import java.io.File;

import org.eclipse.jgit.api.CloneCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.springframework.stereotype.Service;

import com.d1nvan.jdeepwiki.model.params.CreateTaskParams;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class GitService {
    /**
     * 克隆git仓库到本地
     * @param repoUrl 仓库地址
     * @param username 用户名
     * @param branch 分支
     * @param password 密码
     * @return 本地路径
     */
    public String cloneRepository(CreateTaskParams createTaskParams, String localPath) {
        CloneCommand cloneCommand = Git.cloneRepository()
                .setURI(createTaskParams.getProjectUrl())
                .setDirectory(new File(localPath))
                .setCredentialsProvider(new UsernamePasswordCredentialsProvider(createTaskParams.getUserName(), createTaskParams.getPassword()));
        if (createTaskParams.getBranch() != null && !createTaskParams.getBranch().isEmpty()) {
            cloneCommand.setBranch(createTaskParams.getBranch());
        }
        try {
            cloneCommand.call().close();
        } catch (Exception e) {
            throw new RuntimeException("克隆仓库失败: " + e.getMessage(), e);
        }
        return localPath;
    }
} 