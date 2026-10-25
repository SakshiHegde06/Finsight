package com.finsight.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {

    @NotBlank(message = "Transaction description is required")
    private String description;

    @NotNull(message = "Transaction amount is required")
    @Positive(message = "Amount must be greater than zero")
    private Double amount;

    private String category;
    private String merchant;

    @PastOrPresent(message = "Transaction date cannot be in the future")
    private LocalDate date;
    
    @Builder.Default
    private String type = "EXPENSE"; // EXPENSE or INCOME
    
    private String paymentMethod;
    private List<String> tags;
    private Boolean autoCategorizeWithAi;
}
