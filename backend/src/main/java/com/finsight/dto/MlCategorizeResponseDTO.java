package com.finsight.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MlCategorizeResponseDTO {

    private String category;
    
    @JsonProperty("display_category")
    private String displayCategory;
    
    private Double confidence;
    
    @JsonProperty("suggested_tags")
    private List<String> suggestedTags;
}
