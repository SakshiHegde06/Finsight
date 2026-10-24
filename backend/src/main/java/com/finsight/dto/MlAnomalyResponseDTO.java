package com.finsight.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MlAnomalyResponseDTO {

    @JsonProperty("is_anomaly")
    private Boolean isAnomaly;

    @JsonProperty("anomaly_score")
    private Double anomalyScore;

    private String reason;
    private Double confidence;

    @JsonProperty("expected_range")
    private Map<String, Double> expectedRange;
}
