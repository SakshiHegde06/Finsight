package com.finsight.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "transactions")
public class Transaction {

    @Id
    private String id;

    private String description;
    private Double amount;
    private String category;
    private String displayCategory;
    private String merchant;
    private LocalDate date;
    
    @Builder.Default
    private String type = "EXPENSE"; // EXPENSE or INCOME
    
    @Builder.Default
    private Boolean isAnomaly = false;
    
    @Builder.Default
    private Double anomalyScore = 0.0;
    
    private String anomalyReason;
    
    @Builder.Default
    private List<String> tags = new ArrayList<>();
    
    @Builder.Default
    private String paymentMethod = "UPI";
    
    private String transactionRef;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
