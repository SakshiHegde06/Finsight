package com.finsight.util;

import com.finsight.model.Budget;
import com.finsight.model.FinancialInsight;
import com.finsight.model.Transaction;
import com.finsight.repository.BudgetRepository;
import com.finsight.repository.FinancialInsightRepository;
import com.finsight.repository.TransactionRepository;
import com.finsight.service.BudgetService;
import com.finsight.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final FinancialInsightRepository insightRepository;
    private final BudgetService budgetService;
    private final TransactionService transactionService;

    @Override
    public void run(String... args) {
        log.info("[*] Checking FinSight database state...");
        try {
            // 1. Purge legacy demo transactions so dashboard starts with only user transactions
            int cleaned = transactionService.clearDemoData();
            if (cleaned > 0) {
                log.info("[✓] Removed {} legacy demo transactions from database.", cleaned);
            }

            // 2. Clear pre-seeded static dummy insights
            insightRepository.deleteAll();
            log.info("[✓] Cleared legacy static dummy insights.");

            // 3. Ensure budgets are initialized for the active month
            LocalDate today = LocalDate.now();
            String currentMonthYear = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            budgetService.getBudgetsForMonth(currentMonthYear);

            log.info("[✓] FinSight ready with 100% live, dynamic user metrics.");
        } catch (Exception e) {
            log.error("[!] Warning: Initial database check failed: {}. Please verify SPRING_DATA_MONGODB_URI in Render Environment variables.", e.getMessage());
        }
    }
}
