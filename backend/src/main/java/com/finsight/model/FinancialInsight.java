package com.finsight.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "financial_insights")
public class FinancialInsight {

    @Id
    private String id;

    private String type; // SAVINGS, WARNING, BUDGET_OPTIMIZATION, SUBSCRIPTION, INVESTMENT
    private String severity; // INFO, LOW, MEDIUM, HIGH
    private String title;
    private String message;
    private Double potentialSavings;
    private String action;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
