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
public class MlForecastResponseDTO {

    @JsonProperty("current_spend")
    private Double currentSpend;

    @JsonProperty("projected_end_of_month")
    private Double projectedEndOfMonth;

    @JsonProperty("budget_variance")
    private Double budgetVariance;

    @JsonProperty("burn_rate_daily")
    private Double burnRateDaily;

    @JsonProperty("is_overbudget_risk")
    private Boolean isOverbudgetRisk;

    @JsonProperty("confidence_level")
    private String confidenceLevel;

    @JsonProperty("forecast_points")
    private List<Map<String, Object>> forecastPoints;
}
