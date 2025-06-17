package com.d1nvan.jdeepwiki.model.params;

import lombok.Data;

@Data
public class ListPageParams {

    private Integer pageIndex = 1;

    private Integer pageSize = 10;

    private String projectName;

    private String taskId;

    private String userName;

}
