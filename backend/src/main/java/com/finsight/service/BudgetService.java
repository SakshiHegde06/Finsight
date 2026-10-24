package com.finsight.service;

import com.finsight.dto.BudgetRequest;
import com.finsight.model.Budget;
import com.finsight.model.Transaction;
import com.finsight.repository.BudgetRepository;
import com.finsight.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    public List<Budget> getBudgetsForMonth(String monthYear) {
        String targetMonthYear = (monthYear != null && !monthYear.isBlank()) 
                ? monthYear 
                : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        List<Budget> budgets = budgetRepository.findByMonthYear(targetMonthYear);
        if (budgets.isEmpty()) {
            budgets = initializeDefaultBudgets(targetMonthYear);
        }

        recalculateBudgetSpending(targetMonthYear);
        return budgetRepository.findByMonthYear(targetMonthYear);
    }

    public Budget createOrUpdateBudget(BudgetRequest request) {
        String cat = request.getCategory().toLowerCase();
        String my = request.getMonthYear();

        Optional<Budget> existing = budgetRepository.findByCategoryAndMonthYear(cat, my);
        Budget budget;
        if (existing.isPresent()) {
            budget = existing.get();
            budget.setAllocatedAmount(request.getAllocatedAmount());
            if (request.getColor() != null) budget.setColor(request.getColor());
            if (request.getAlertThreshold() != null) budget.setAlertThreshold(request.getAlertThreshold());
        } else {
            budget = Budget.builder()
                    .category(cat)
                    .displayCategory(request.getDisplayCategory() != null ? request.getDisplayCategory() : formatDisplayCategory(cat))
                    .allocatedAmount(request.getAllocatedAmount())
                    .monthYear(my)
                    .color(request.getColor() != null ? request.getColor() : getCategoryColor(cat))
                    .alertThreshold(request.getAlertThreshold() != null ? request.getAlertThreshold() : 0.85)
                    .spentAmount(0.0)
                    .build();
        }

        Budget saved = budgetRepository.save(budget);
        recalculateBudgetSpending(my);
        return saved;
    }

    public boolean deleteBudget(String id) {
        return budgetRepository.findById(id).map(b -> {
            budgetRepository.delete(b);
            return true;
        }).orElse(false);
    }

    public void recalculateBudgetSpending(String monthYear) {
        try {
            LocalDate date = LocalDate.parse(monthYear + "-01");
            LocalDate start = date.withDayOfMonth(1);
            LocalDate end = date.withDayOfMonth(date.lengthOfMonth());

            List<Transaction> monthTxs = transactionRepository.findByDateBetweenOrderByDateDesc(start, end);
            List<Budget> budgets = budgetRepository.findByMonthYear(monthYear);

            for (Budget b : budgets) {
                double spent = monthTxs.stream()
                        .filter(t -> b.getCategory().equalsIgnoreCase(t.getCategory()) && !"INCOME".equalsIgnoreCase(t.getType()))
                        .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                        .sum();
                b.setSpentAmount(spent);
                budgetRepository.save(b);
            }
        } catch (Exception e) {
            log.error("Error recalculating budget spending for {}: {}", monthYear, e.getMessage());
        }
    }

    private List<Budget> initializeDefaultBudgets(String monthYear) {
        List<Budget> defaults = List.of(
                createBudgetEntity("food", "Food & Dining", 15000.0, monthYear, "#f97316"),
                createBudgetEntity("shopping", "Shopping", 12000.0, monthYear, "#ec4899"),
                createBudgetEntity("travel", "Travel & Commute", 10000.0, monthYear, "#06b6d4"),
                createBudgetEntity("utilities", "Utilities & Bills", 8000.0, monthYear, "#eab308"),
                createBudgetEntity("entertainment", "Entertainment", 6000.0, monthYear, "#8b5cf6"),
                createBudgetEntity("healthcare", "Healthcare", 8000.0, monthYear, "#ef4444"),
                createBudgetEntity("investment", "Investments", 20000.0, monthYear, "#10b981"),
                createBudgetEntity("emi", "Loan & EMI", 25000.0, monthYear, "#6366f1"),
                createBudgetEntity("education", "Education", 10000.0, monthYear, "#3b82f6")
        );
        return budgetRepository.saveAll(defaults);
    }

    private Budget createBudgetEntity(String cat, String disp, Double amt, String my, String color) {
        return Budget.builder()
                .category(cat)
                .displayCategory(disp)
                .allocatedAmount(amt)
                .spentAmount(0.0)
                .monthYear(my)
                .color(color)
                .alertThreshold(0.85)
                .build();
    }

    private String getCategoryColor(String cat) {
        switch (cat.toLowerCase()) {
            case "food": return "#f97316";
            case "shopping": return "#ec4899";
            case "travel": return "#06b6d4";
            case "utilities": return "#eab308";
            case "entertainment": return "#8b5cf6";
            case "healthcare": return "#ef4444";
            case "investment": return "#10b981";
            case "emi": return "#6366f1";
            case "education": return "#3b82f6";
            default: return "#64748b";
        }
    }

    private String formatDisplayCategory(String cat) {
        switch (cat.toLowerCase()) {
            case "food": return "Food & Dining";
            case "travel": return "Travel & Commute";
            case "shopping": return "Shopping";
            case "emi": return "Loan & EMI";
            case "entertainment": return "Entertainment";
            case "healthcare": return "Healthcare";
            case "investment": return "Investments";
            case "utilities": return "Utilities & Bills";
            case "education": return "Education";
            default: return cat.substring(0, 1).toUpperCase() + cat.substring(1);
        }
    }
}
