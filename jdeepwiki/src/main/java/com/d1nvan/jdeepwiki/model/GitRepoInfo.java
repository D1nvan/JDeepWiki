package com.d1nvan.jdeepwiki.model;

public class GitRepoInfo {
    private String gitUrl;
    private String username;
    private String password;

    // 构造函数
    public GitRepoInfo() {
    }

    // Getter和Setter方法
    public String getGitUrl() {
        return gitUrl;
    }

    public void setGitUrl(String gitUrl) {
        this.gitUrl = gitUrl;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}