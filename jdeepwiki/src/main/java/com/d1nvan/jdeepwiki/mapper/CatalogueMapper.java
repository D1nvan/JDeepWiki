package com.d1nvan.jdeepwiki.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.d1nvan.jdeepwiki.model.entity.Catalogue;

@Mapper
public interface CatalogueMapper extends BaseMapper<Catalogue> {
}