package com.finsight.service;

import com.finsight.dto.*;
import com.finsight.model.Budget;
import com.finsight.model.Transaction;
import com.finsight.repository.BudgetRepository;
import com.finsight.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final MlServiceClient mlServiceClient;
    private final BudgetService budgetService;

    public DashboardSummaryDTO getDashboardSummary(String monthYear) {
        String my = (monthYear != null && !monthYear.isBlank()) 
                ? monthYear 
                : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        LocalDate date = LocalDate.parse(my + "-01");
        LocalDate start = date.withDayOfMonth(1);
        LocalDate end = date.withDayOfMonth(date.lengthOfMonth());

        List<Transaction> monthTxs = transactionRepository.findByDateBetweenOrderByDateDesc(start, end);
        List<Budget> budgets = budgetService.getBudgetsForMonth(my);

        double totalIncome = monthTxs.stream()
                .filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        double totalExpense = monthTxs.stream()
                .filter(t -> !"INCOME".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        double netSavings = totalIncome - totalExpense;
        double savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100.0 : 0.0;

        double totalBudget = budgets.stream()
                .mapToDouble(b -> b.getAllocatedAmount() != null ? b.getAllocatedAmount() : 0.0)
                .sum();

        double budgetUtilization = totalBudget > 0 ? (totalExpense / totalBudget) * 100.0 : 0.0;
        double remainingBudget = Math.max(0.0, totalBudget - totalExpense);

        int currentDay = Math.min(LocalDate.now().getDayOfMonth(), date.lengthOfMonth());
        double dailyBurnRate = currentDay > 0 ? (totalExpense / currentDay) : 0.0;

        long anomalyCount = monthTxs.stream()
                .filter(t -> Boolean.TRUE.equals(t.getIsAnomaly()))
                .count();

        // Ask ML service for personalized health score and recommendations
        MlRecommendationResponseDTO mlRecs = mlServiceClient.getRecommendations(totalIncome, monthTxs, budgets);
        int healthScore = (mlRecs != null && mlRecs.getHealthScore() != null) 
                ? mlRecs.getHealthScore() 
                : ((totalExpense > 0 || totalIncome > 0) ? 50 : 0);
        String healthStatus = (mlRecs != null && mlRecs.getHealthStatus() != null) 
                ? mlRecs.getHealthStatus() 
                : ((totalExpense > 0 || totalIncome > 0) ? "Active" : "No Data");
        List<String> insights = mlRecs != null && mlRecs.getSummaryInsights() != null 
                ? mlRecs.getSummaryInsights() 
                : List.of();

        List<CategorySpendDTO> topCategories = getCategoryBreakdown(my).stream()
                .limit(5)
                .collect(Collectors.toList());

        return DashboardSummaryDTO.builder()
                .totalIncome(round(totalIncome))
                .totalExpense(round(totalExpense))
                .netSavings(round(netSavings))
                .savingsRate(round(savingsRate))
                .totalBudget(round(totalBudget))
                .budgetUtilization(round(budgetUtilization))
                .remainingBudget(round(remainingBudget))
                .dailyBurnRate(round(dailyBurnRate))
                .transactionCount((long) monthTxs.size())
                .anomalyCount(anomalyCount)
                .healthScore(healthScore)
                .healthStatus(healthStatus)
                .topCategories(topCategories)
                .quickInsights(insights)
                .build();
    }

    public List<CategorySpendDTO> getCategoryBreakdown(String monthYear) {
        String my = (monthYear != null && !monthYear.isBlank()) 
                ? monthYear 
                : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        LocalDate date = LocalDate.parse(my + "-01");
        LocalDate start = date.withDayOfMonth(1);
        LocalDate end = date.withDayOfMonth(date.lengthOfMonth());

        List<Transaction> monthTxs = transactionRepository.findByDateBetweenOrderByDateDesc(start, end);
        List<Budget> budgets = budgetRepository.findByMonthYear(my);
        Map<String, Budget> budgetMap = budgets.stream()
                .collect(Collectors.toMap(b -> b.getCategory().toLowerCase(), b -> b, (e1, e2) -> e1));

        double totalExpense = monthTxs.stream()
                .filter(t -> !"INCOME".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        Map<String, List<Transaction>> grouped = monthTxs.stream()
                .filter(t -> !"INCOME".equalsIgnoreCase(t.getType()))
                .collect(Collectors.groupingBy(t -> t.getCategory().toLowerCase()));

        List<CategorySpendDTO> list = new ArrayList<>();
        for (Map.Entry<String, List<Transaction>> entry : grouped.entrySet()) {
            String cat = entry.getKey();
            List<Transaction> txs = entry.getValue();
            double spent = txs.stream().mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0).sum();
            double pct = totalExpense > 0 ? (spent / totalExpense) * 100.0 : 0.0;

            Budget b = budgetMap.get(cat);
            double allocated = b != null && b.getAllocatedAmount() != null ? b.getAllocatedAmount() : 0.0;
            double util = allocated > 0 ? (spent / allocated) * 100.0 : 0.0;
            String color = b != null && b.getColor() != null ? b.getColor() : getCategoryColor(cat);
            String disp = b != null && b.getDisplayCategory() != null ? b.getDisplayCategory() : formatDisplayCategory(cat);

            list.add(CategorySpendDTO.builder()
                    .category(cat)
                    .displayCategory(disp)
                    .amount(round(spent))
                    .percentage(round(pct))
                    .allocatedBudget(round(allocated))
                    .utilizationRate(round(util))
                    .color(color)
                    .transactionCount((long) txs.size())
                    .build());
        }

        list.sort((a, b) -> Double.compare(b.getAmount(), a.getAmount()));
        return list;
    }

    public List<MonthlyTrendDTO> getMonthlyTrends(int monthsCount) {
        int count = monthsCount > 0 ? monthsCount : 6;
        List<MonthlyTrendDTO> trends = new ArrayList<>();
        LocalDate now = LocalDate.now();

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM yyyy");
        DateTimeFormatter myFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (int i = count - 1; i >= 0; i--) {
            LocalDate mDate = now.minusMonths(i);
            LocalDate start = mDate.withDayOfMonth(1);
            LocalDate end = mDate.withDayOfMonth(mDate.lengthOfMonth());
            String my = mDate.format(myFormatter);

            List<Transaction> txs = transactionRepository.findByDateBetweenOrderByDateDesc(start, end);
            List<Budget> budgets = budgetRepository.findByMonthYear(my);

            double income = txs.stream()
                    .filter(t -> "INCOME".equalsIgnoreCase(t.getType()))
                    .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                    .sum();

            double expense = txs.stream()
                    .filter(t -> !"INCOME".equalsIgnoreCase(t.getType()))
                    .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                    .sum();

            double totalAllocated = budgets.stream()
                    .mapToDouble(b -> b.getAllocatedAmount() != null ? b.getAllocatedAmount() : 0.0)
                    .sum();

            trends.add(MonthlyTrendDTO.builder()
                    .month(mDate.format(dtf))
                    .income(round(income))
                    .expense(round(expense))
                    .netSavings(round(income - expense))
                    .budget(round(totalAllocated))
                    .build());
        }
        return trends;
    }

    public MlForecastResponseDTO getSpendingForecast(String monthYear) {
        String my = (monthYear != null && !monthYear.isBlank()) 
                ? monthYear 
                : LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        LocalDate date = LocalDate.parse(my + "-01");
        LocalDate start = date.withDayOfMonth(1);
        LocalDate end = date.withDayOfMonth(date.lengthOfMonth());

        List<Transaction> monthTxs = transactionRepository.findByDateBetweenOrderByDateDesc(start, end);
        List<Budget> budgets = budgetRepository.findByMonthYear(my);

        double totalBudget = budgets.stream()
                .mapToDouble(b -> b.getAllocatedAmount() != null ? b.getAllocatedAmount() : 0.0)
                .sum();

        return mlServiceClient.getForecast(totalBudget, monthTxs);
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
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
