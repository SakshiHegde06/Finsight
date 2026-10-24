package com.finsight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendDTO {

    private String month; // e.g. "Jun 2026", "Jul 2026"
    private Double income;
    private Double expense;
    private Double netSavings;
    private Double budget;
}
