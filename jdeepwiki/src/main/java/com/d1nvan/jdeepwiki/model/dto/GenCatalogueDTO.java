package com.d1nvan.jdeepwiki.model.dto;

import java.util.List;

import com.d1nvan.jdeepwiki.model.entity.Catalogue;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GenCatalogueDTO {
    private CatalogueStruct catalogueStruct;

    private List<Catalogue> catalogueList;
}
