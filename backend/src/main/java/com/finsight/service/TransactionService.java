package com.finsight.service;

import com.finsight.dto.MlAnomalyResponseDTO;
import com.finsight.dto.MlCategorizeResponseDTO;
import com.finsight.dto.TransactionRequest;
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
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final MlServiceClient mlServiceClient;

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByDateDesc();
    }

    public Optional<Transaction> getTransactionById(String id) {
        return transactionRepository.findById(id);
    }

    public Transaction createTransaction(TransactionRequest request) {
        String category = request.getCategory();
        String displayCategory = null;

        // Auto-categorize via ML service if empty or flag is true
        if (category == null || category.trim().isEmpty() || Boolean.TRUE.equals(request.getAutoCategorizeWithAi())) {
            MlCategorizeResponseDTO mlCat = mlServiceClient.categorize(
                    request.getDescription(),
                    request.getMerchant(),
                    request.getAmount()
            );
            if (mlCat != null && mlCat.getCategory() != null) {
                category = mlCat.getCategory();
                displayCategory = mlCat.getDisplayCategory();
            }
        }

        if (category == null || category.trim().isEmpty()) {
            category = "shopping";
            displayCategory = "Shopping";
        }

        LocalDate txDate = request.getDate() != null ? request.getDate() : LocalDate.now();

        Transaction transaction = Transaction.builder()
                .description(request.getDescription())
                .amount(request.getAmount())
                .category(category.toLowerCase())
                .displayCategory(displayCategory != null ? displayCategory : formatDisplayCategory(category))
                .merchant(request.getMerchant())
                .date(txDate)
                .type(request.getType() != null ? request.getType().toUpperCase() : "EXPENSE")
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI")
                .tags(request.getTags() != null ? request.getTags() : List.of(category))
                .transactionRef("TXN" + UUID.randomUUID().toString().replace("-", "").substring(0, 8))
                .build();

        // Perform ML Anomaly Detection if it is an expense
        if (!"INCOME".equalsIgnoreCase(transaction.getType())) {
            List<Transaction> history = transactionRepository.findByCategoryOrderByDateDesc(transaction.getCategory());
            MlAnomalyResponseDTO anomalyResult = mlServiceClient.detectAnomaly(transaction, history);
            if (anomalyResult != null) {
                transaction.setIsAnomaly(anomalyResult.getIsAnomaly());
                transaction.setAnomalyScore(anomalyResult.getAnomalyScore());
                transaction.setAnomalyReason(anomalyResult.getReason());
            }
        }

        Transaction saved = transactionRepository.save(transaction);
        updateBudgetSpending(saved.getCategory(), txDate);

        return saved;
    }

    public Optional<Transaction> updateTransaction(String id, TransactionRequest request) {
        return transactionRepository.findById(id).map(existing -> {
            String oldCat = existing.getCategory();
            LocalDate oldDate = existing.getDate();

            existing.setDescription(request.getDescription());
            existing.setAmount(request.getAmount());
            if (request.getCategory() != null && !request.getCategory().isBlank()) {
                existing.setCategory(request.getCategory().toLowerCase());
                existing.setDisplayCategory(formatDisplayCategory(request.getCategory()));
            }
            if (request.getMerchant() != null) {
                existing.setMerchant(request.getMerchant());
            }
            if (request.getDate() != null) {
                existing.setDate(request.getDate());
            }
            if (request.getType() != null) {
                existing.setType(request.getType().toUpperCase());
            }
            if (request.getPaymentMethod() != null) {
                existing.setPaymentMethod(request.getPaymentMethod());
            }

            Transaction updated = transactionRepository.save(existing);
            updateBudgetSpending(oldCat, oldDate);
            if (!oldCat.equalsIgnoreCase(updated.getCategory())) {
                updateBudgetSpending(updated.getCategory(), updated.getDate());
            }
            return updated;
        });
    }

    public boolean deleteTransaction(String id) {
        return transactionRepository.findById(id).map(tx -> {
            transactionRepository.delete(tx);
            updateBudgetSpending(tx.getCategory(), tx.getDate());
            return true;
        }).orElse(false);
    }

    public List<Transaction> getAnomalies() {
        return transactionRepository.findByIsAnomalyTrueOrderByDateDesc();
    }

    public int reanalyzeAllAnomalies() {
        List<Transaction> all = transactionRepository.findAll();
        int count = 0;
        for (Transaction t : all) {
            if (!"INCOME".equalsIgnoreCase(t.getType())) {
                MlAnomalyResponseDTO res = mlServiceClient.detectAnomaly(t, all);
                if (res != null) {
                    t.setIsAnomaly(res.getIsAnomaly());
                    t.setAnomalyScore(res.getAnomalyScore());
                    t.setAnomalyReason(res.getReason());
                    transactionRepository.save(t);
                    if (Boolean.TRUE.equals(res.getIsAnomaly())) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    public void updateBudgetSpending(String category, LocalDate date) {
        if (category == null || date == null) return;
        String monthYear = date.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        LocalDate start = date.withDayOfMonth(1);
        LocalDate end = date.withDayOfMonth(date.lengthOfMonth());

        List<Transaction> monthCatTxs = transactionRepository.findByDateBetweenOrderByDateDesc(start, end);
        double totalSpent = monthCatTxs.stream()
                .filter(t -> category.equalsIgnoreCase(t.getCategory()) && !"INCOME".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        budgetRepository.findByCategoryAndMonthYear(category.toLowerCase(), monthYear).ifPresent(b -> {
            b.setSpentAmount(totalSpent);
            budgetRepository.save(b);
        });
    }

    public int clearDemoData() {
        List<String> demoDescriptions = List.of(
            "Monthly Corporate Payroll Direct Deposit",
            "Uber ride to Tech Park",
            "Flipkart order wireless earbuds",
            "Home loan EMI HDFC Bank",
            "Netflix subscription monthly plan",
            "Hospital bill annual checkup",
            "Ola cab city commute",
            "Mutual fund SIP Index 50",
            "Electricity bill payment BESCOM",
            "Swiggy gourmet dinner order",
            "Amazon purchase mechanical keyboard",
            "Water bill municipal corporation",
            "PPF contribution retirement savings",
            "Zomato weekend family dinner",
            "Car loan EMI ICICI Bank",
            "Mobile recharge annual pack",
            "Doctor consultation specialist fee",
            "Online course subscription FullStack AI",
            "Movie ticket booking IMAX 3D",
            "Train ticket IRCTC executive express",
            "Gas bill payment piped PNG",
            "Pizza delivery weekend treat",
            "Pharmacy medicine purchase monthly prescription",
            "Cafe coffee artisan espresso",
            "Stock purchase blue-chip equity",
            "Exam fee professional certificate",
            "Flight ticket booking roundtrip holiday",
            "Luxury Designer Watch purchase",
            "Spike: VIP Club Lounge party bill"
        );

        List<Transaction> all = transactionRepository.findAll();
        List<Transaction> toDelete = all.stream()
                .filter(t -> demoDescriptions.contains(t.getDescription()) || 
                             (t.getMerchant() != null && (t.getMerchant().equals("FinSight Tech Global") || 
                                                          t.getMerchant().equals("Chrono Luxe") || 
                                                          t.getMerchant().equals("Sky Lounge Club"))))
                .collect(java.util.stream.Collectors.toList());

        transactionRepository.deleteAll(toDelete);

        LocalDate today = LocalDate.now();
        String currentMonthYear = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        List<Budget> budgets = budgetRepository.findByMonthYear(currentMonthYear);
        for (Budget b : budgets) {
            updateBudgetSpending(b.getCategory(), today);
        }

        return toDelete.size();
    }

    private String formatDisplayCategory(String cat) {
        if (cat == null) return "General";
        switch (cat.toLowerCase()) {
            case "salary": return "Salary / Wages";
            case "freelance": return "Freelance & Consulting";
            case "business": return "Business Income";
            case "bonus": return "Bonus & Grants";
            case "rental": return "Rental Income";
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
