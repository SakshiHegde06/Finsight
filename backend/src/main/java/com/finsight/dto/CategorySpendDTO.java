package com.finsight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySpendDTO {

    private String category;
    private String displayCategory;
    private Double amount;
    private Double percentage;
    private Double allocatedBudget;
    private Double utilizationRate;
    private String color;
    private Long transactionCount;
}
