package com.d1nvan.jdeepwiki.model.params;

import lombok.Data;

@Data
public class CreateTaskParams {
    private String projectName;
    
    private String projectUrl;

    private String branch;

    private String userName;

    private String password;

    private String sourceType; // git 或 zip

}
