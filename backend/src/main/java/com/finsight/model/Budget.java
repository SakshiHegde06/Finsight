package com.finsight.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "budgets")
public class Budget {

    @Id
    private String id;

    private String category;
    private String displayCategory;
    private Double allocatedAmount;
    
    @Builder.Default
    private Double spentAmount = 0.0;
    
    private String monthYear; // Format: YYYY-MM e.g. "2026-10"
    
    @Builder.Default
    private String color = "#3b82f6";
    
    @Builder.Default
    private Double alertThreshold = 0.85; // 85%
}
