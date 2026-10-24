package com.finsight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {

    private Double totalIncome;
    private Double totalExpense;
    private Double netSavings;
    private Double savingsRate; // Percentage e.g. 24.5%
    
    private Double totalBudget;
    private Double budgetUtilization; // Percentage e.g. 78.2%
    private Double remainingBudget;
    
    private Double dailyBurnRate;
    private Long transactionCount;
    private Long anomalyCount;
    
    private Integer healthScore; // 0 - 100
    private String healthStatus; // Excellent, Good, Fair, Needs Attention
    
    private List<CategorySpendDTO> topCategories;
    private List<String> quickInsights;
}
