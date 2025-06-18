package com.d1nvan.jdeepwiki.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONException;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.d1nvan.jdeepwiki.enums.CatalogueStatusEnum;
import com.d1nvan.jdeepwiki.llm.prompt.AnalyzeCataloguePrompt;
import com.d1nvan.jdeepwiki.llm.prompt.GenDocPrompt;
import com.d1nvan.jdeepwiki.llm.service.LlmService;
import com.d1nvan.jdeepwiki.mapper.CatalogueMapper;
import com.d1nvan.jdeepwiki.model.dto.CatalogueStruct;
import com.d1nvan.jdeepwiki.model.dto.GenCatalogueDTO;
import com.d1nvan.jdeepwiki.model.entity.Catalogue;
import com.d1nvan.jdeepwiki.util.RegexUtil;

import cn.hutool.core.lang.UUID;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CatalogueService extends ServiceImpl<CatalogueMapper, Catalogue> {
    
    @Autowired
    private LlmService llmService;

    public GenCatalogueDTO generateCatalogue(String fileTree, String localpath) {
        // 2.生成项目目录
        String genCataloguePrompt = AnalyzeCataloguePrompt.prompt
                .replace("{{$code_files}}", fileTree)
                .replace("{{$repository_location}}", localpath);
        String result = llmService.callWithTools(genCataloguePrompt);
        log.info("LLM生成项目目录结果:{}", result);

        String documentationStructure = RegexUtil.extractXmlTagContent(result, "<documentation_structure>", "</documentation_structure>");
        CatalogueStruct catalogueStruct = processCatalogueStruct(documentationStructure);
        List<Catalogue> catalogueList = saveCatalogueStruct(catalogueStruct);
        return new GenCatalogueDTO(catalogueStruct, catalogueList);
    }

    public CatalogueStruct processCatalogueStruct(String result) {
        try {
            CatalogueStruct catalogueStruct = JSON.parseObject(result, CatalogueStruct.class);
            if (catalogueStruct.getItems() == null || catalogueStruct.getItems().isEmpty()) {
                log.error("解析LLM生成项目目录失败, LLM生成的目录为空");
                throw new RuntimeException("解析LLM生成项目目录失败, LLM生成的目录为空");
            }
            return catalogueStruct;
        } catch (JSONException e) {
            String msg = "解析LLM生成项目目录失败, LLM生成的目录格式不正确";
            log.error(msg);
            throw new RuntimeException(msg);
        } catch (RuntimeException e) {
            log.error("解析LLM生成项目目录失败", e);
            throw e;
        }
    }

    public List<Catalogue> saveCatalogueStruct(CatalogueStruct catalogueStruct) {
        // 保存项目目录到数据库
        log.info("保存项目目录到数据库:{}", catalogueStruct);
        List<Catalogue> saveList = new ArrayList<>();
        catalogueStruct.getItems().forEach(item -> {
            Catalogue catalogue = new Catalogue();
            String catalogueId = UUID.fastUUID().toString();
            catalogue.setCatalogueId(catalogueId);
            catalogue.setTitle(item.getTitle());
            catalogue.setName(item.getName());
            catalogue.setPrompt(item.getPrompt());
            catalogue.setDependentFile(String.join(",", item.getDependent_file()));
            catalogue.setStatus(CatalogueStatusEnum.IN_PROGRESS.getCode());
            saveList.add(catalogue);

            item.getChildren().forEach(children -> {
                Catalogue childrenCatalogue = new Catalogue();
                String childrenCatalogueId = UUID.fastUUID().toString();
                childrenCatalogue.setCatalogueId(childrenCatalogueId);
                childrenCatalogue.setParentCatalogueId(catalogueId);
                childrenCatalogue.setTitle(children.getTitle());
                childrenCatalogue.setName(children.getName());
                childrenCatalogue.setPrompt(children.getPrompt());
                childrenCatalogue.setDependentFile(String.join(",", children.getDependent_file()));
                catalogue.setStatus(CatalogueStatusEnum.IN_PROGRESS.getCode());
                saveList.add(childrenCatalogue);
            });
        });
        this.saveBatch(saveList);
        return saveList;
    }

    public void parallelGenerateCatalogueDetail(String fileTree, GenCatalogueDTO genCatalogueDTO, String localPath) {
        genCatalogueDTO.getCatalogueList().forEach(catalogue -> {
            if(StringUtils.isNotEmpty(catalogue.getParentCatalogueId())){
                generateCatalogueDetail(catalogue, fileTree, genCatalogueDTO.getCatalogueStruct(), localPath);
            }
        });
    }

    @Async("GenCatalogueDetailExcutor")
    public void generateCatalogueDetail(Catalogue catalogue, String fileTree, CatalogueStruct catalogueStruct, String localPath) {
        try{
            log.info("LLM开始生成{}目录详情", catalogue.getName());
            String template = GenDocPrompt.prompt
                    .replace("{{$repository_location}}", localPath)
                    .replace("{{$prompt}}", catalogue.getPrompt())
                    .replace("{{$title}}", catalogue.getName())
                    .replace("{{$repository_files}}", fileTree)
                    .replace("{{$catalogue}}", JSON.toJSONString(catalogueStruct));
            String result = llmService.callWithTools(template);
            log.info("LLM生成{}目录详情结果:{}", catalogue.getName(), result);
            if(StringUtils.isEmpty(result)){
                throw new RuntimeException("LLM生成目录详情返回结果为空");
            }
            // 保存目录详情到数据库
            catalogue.setContent(result);
            catalogue.setStatus(CatalogueStatusEnum.COMPLETED.getCode());
        }catch(Exception e){
            log.error("LLM生成{}目录详情失败", catalogue.getName(), e);
            catalogue.setStatus(CatalogueStatusEnum.FAILED.getCode());
            catalogue.setFailReason(e.getMessage());
        }finally{
            this.updateById(catalogue);
        }
    }
}
