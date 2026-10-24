package com.finsight.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetRequest {

    @NotBlank(message = "Category is required")
    private String category;

    private String displayCategory;

    @NotNull(message = "Allocated amount is required")
    @Positive(message = "Allocated budget must be positive")
    private Double allocatedAmount;

    @NotBlank(message = "Month-Year is required (YYYY-MM)")
    private String monthYear;

    private String color;
    private Double alertThreshold;
}
