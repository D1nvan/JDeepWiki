package com.d1nvan.jdeepwiki.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CatalogueStatusEnum {
    IN_PROGRESS(1, "进行中"),
    COMPLETED(2, "已完成"),
    FAILED(3, "处理失败");

    @EnumValue
    private final Integer code;

    @JsonValue
    private final String desc;

}
