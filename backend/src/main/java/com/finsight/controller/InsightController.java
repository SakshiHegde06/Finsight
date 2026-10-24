package com.finsight.controller;

import com.finsight.dto.MlRecommendationResponseDTO;
import com.finsight.model.Budget;
import com.finsight.model.FinancialInsight;
import com.finsight.model.Transaction;
import com.finsight.repository.BudgetRepository;
import com.finsight.repository.FinancialInsightRepository;
import com.finsight.repository.TransactionRepository;
import com.finsight.service.MlServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightController {

    private final FinancialInsightRepository insightRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final MlServiceClient mlServiceClient;

    @GetMapping
    public ResponseEntity<List<FinancialInsight>> getInsights(
            @RequestParam(required = false) String monthYear) {
        String my = (monthYear != null && !monthYear.isBlank()) 
                ? monthYear 
                : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        List<FinancialInsight> insights = generateInsightsForMonth(my);
        return ResponseEntity.ok(insights);
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateNewInsights(
            @RequestParam(required = false) String monthYear) {
        String my = (monthYear != null && !monthYear.isBlank()) 
                ? monthYear 
                : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        List<FinancialInsight> insights = generateInsightsForMonth(my);
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "AI generated new insights based on active transactions and budgets",
                "count", insights.size(),
                "insights", insights
        ));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> clearInsights() {
        insightRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "All cached insights cleared"));
    }

    private List<FinancialInsight> generateInsightsForMonth(String monthYear) {
        try {
            LocalDate date = LocalDate.parse(monthYear + "-01");
            LocalDate start = date.withDayOfMonth(1);
            LocalDate end = date.withDayOfMonth(date.lengthOfMonth());

            List<Transaction> transactions = transactionRepository.findByDateBetweenOrderByDateDesc(start, end);
            List<Budget> budgets = budgetRepository.findByMonthYear(monthYear);

            double totalIncome = transactions.stream()
                    .filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
                    .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                    .sum();

            MlRecommendationResponseDTO recs = mlServiceClient.getRecommendations(totalIncome, transactions, budgets);

            List<FinancialInsight> freshInsights = new ArrayList<>();

            // 1. Real detected spending anomalies
            for (Transaction t : transactions) {
                if (Boolean.TRUE.equals(t.getIsAnomaly())) {
                    freshInsights.add(FinancialInsight.builder()
                            .type("WARNING")
                            .severity("HIGH")
                            .title("Spending Anomaly Detected: " + t.getDescription())
                            .message(t.getAnomalyReason() != null ? t.getAnomalyReason() : ("₹" + String.format("%.0f", t.getAmount()) + " deviates significantly from typical spending patterns."))
                            .potentialSavings(t.getAmount())
                            .action("Review Anomaly Record")
                            .createdAt(LocalDateTime.now())
                            .build());
                }
            }

            // 2. Real AI recommendations
            if (recs != null && recs.getRecommendations() != null) {
                for (Map<String, Object> r : recs.getRecommendations()) {
                    freshInsights.add(FinancialInsight.builder()
                            .type((String) r.get("type"))
                            .severity((String) r.get("severity"))
                            .title((String) r.get("title"))
                            .message((String) r.get("message"))
                            .potentialSavings(r.get("potential_savings") != null ? Double.valueOf(r.get("potential_savings").toString()) : 0.0)
                            .action((String) r.get("action"))
                            .createdAt(LocalDateTime.now())
                            .build());
                }
            }

            // Sync with repository
            insightRepository.deleteAll();
            if (!freshInsights.isEmpty()) {
                return insightRepository.saveAll(freshInsights);
            }
            return freshInsights;
        } catch (Exception e) {
            log.error("Error generating insights for {}: {}", monthYear, e.getMessage());
            return insightRepository.findAllByOrderByCreatedAtDesc();
        }
    }
}
