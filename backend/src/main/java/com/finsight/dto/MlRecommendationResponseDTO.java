package com.finsight.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MlRecommendationResponseDTO {

    @JsonProperty("health_score")
    private Integer healthScore;

    @JsonProperty("health_status")
    private String healthStatus;

    @JsonProperty("savings_rate")
    private Double savingsRate;

    private List<Map<String, Object>> recommendations;

    @JsonProperty("summary_insights")
    private List<String> summaryInsights;
}
