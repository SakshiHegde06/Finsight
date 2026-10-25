package com.finsight.service;

import com.finsight.dto.MlAnomalyResponseDTO;
import com.finsight.dto.MlCategorizeResponseDTO;
import com.finsight.dto.MlForecastResponseDTO;
import com.finsight.dto.MlRecommendationResponseDTO;
import com.finsight.model.Budget;
import com.finsight.model.Transaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class MlServiceClient {

    private final RestTemplate restTemplate;

    @Value("${finsight.ml-service.url:http://localhost:8000/api/ml}")
    private String mlServiceUrl;

    public MlServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public MlCategorizeResponseDTO categorize(String description, String merchant, Double amount) {
        try {
            String url = getNormalizedBaseUrl() + "/categorize";
            Map<String, Object> req = new HashMap<>();
            req.put("description", description);
            req.put("merchant", merchant != null ? merchant : "");
            req.put("amount", amount);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(req, headers);

            return restTemplate.postForObject(url, entity, MlCategorizeResponseDTO.class);
        } catch (Exception e) {
            log.warn("ML Service unavailable for categorization. Falling back to rule-based: {}", e.getMessage());
            return fallbackCategorize(description);
        }
    }

    public MlAnomalyResponseDTO detectAnomaly(Transaction current, List<Transaction> history) {
        try {
            String url = getNormalizedBaseUrl() + "/anomalies/detect";

            Map<String, Object> req = new HashMap<>();
            req.put("current_transaction", mapTransaction(current));

            List<Map<String, Object>> histList = new ArrayList<>();
            for (Transaction h : history) {
                if (!Objects.equals(h.getId(), current.getId())) {
                    histList.add(mapTransaction(h));
                }
            }
            req.put("history", histList);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(req, headers);

            return restTemplate.postForObject(url, entity, MlAnomalyResponseDTO.class);
        } catch (Exception e) {
            log.warn("ML Service unavailable for anomaly detection: {}", e.getMessage());
            return fallbackAnomaly(current);
        }
    }

    public MlForecastResponseDTO getForecast(Double monthlyBudget, List<Transaction> transactions) {
        try {
            String url = getNormalizedBaseUrl() + "/forecast";

            Map<String, Object> req = new HashMap<>();
            req.put("monthly_budget", monthlyBudget != null ? monthlyBudget : 50000.0);
            
            List<Map<String, Object>> txList = new ArrayList<>();
            for (Transaction t : transactions) {
                txList.add(mapTransaction(t));
            }
            req.put("transactions", txList);
            req.put("days_in_month", 30);
            req.put("current_day", LocalDateNowDay());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(req, headers);

            return restTemplate.postForObject(url, entity, MlForecastResponseDTO.class);
        } catch (Exception e) {
            log.warn("ML Service unavailable for forecasting: {}", e.getMessage());
            return fallbackForecast(monthlyBudget, transactions);
        }
    }

    public MlRecommendationResponseDTO getRecommendations(Double income, List<Transaction> transactions, List<Budget> budgets) {
        try {
            String url = getNormalizedBaseUrl() + "/recommendations";

            Map<String, Object> req = new HashMap<>();
            req.put("monthly_income", income != null ? income : 65000.0);

            List<Map<String, Object>> txList = new ArrayList<>();
            for (Transaction t : transactions) {
                txList.add(mapTransaction(t));
            }
            req.put("transactions", txList);

            List<Map<String, Object>> budgetList = new ArrayList<>();
            for (Budget b : budgets) {
                Map<String, Object> bm = new HashMap<>();
                bm.put("category", b.getCategory());
                bm.put("allocated", b.getAllocatedAmount());
                bm.put("spent", b.getSpentAmount());
                budgetList.add(bm);
            }
            req.put("budgets", budgetList);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(req, headers);

            return restTemplate.postForObject(url, entity, MlRecommendationResponseDTO.class);
        } catch (Exception e) {
            log.warn("ML Service unavailable for recommendations: {}", e.getMessage());
            return fallbackRecommendations(income, transactions, budgets);
        }
    }

    private int LocalDateNowDay() {
        return java.time.LocalDate.now().getDayOfMonth();
    }

    private String getNormalizedBaseUrl() {
        if (mlServiceUrl == null || mlServiceUrl.isBlank()) {
            return "http://localhost:8000/api/ml";
        }
        String clean = mlServiceUrl.trim().replaceAll("\\s+", "");
        if (clean.contains("finsight-ml-service") && !clean.contains(".onrender.com")) {
            clean = clean.replaceFirst("^https?://", "");
            clean = "https://" + clean + ".onrender.com";
        } else if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
            clean = clean.contains("onrender.com") ? "https://" + clean : "http://" + clean;
        } else if (clean.contains("onrender.com") && clean.startsWith("http://")) {
            clean = "https://" + clean.substring(7);
        }

        while (clean.endsWith("/")) {
            clean = clean.substring(0, clean.length() - 1);
        }
        if (!clean.endsWith("/api/ml")) {
            clean += "/api/ml";
        }
        return clean;
    }

    private Map<String, Object> mapTransaction(Transaction t) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", t.getId());
        map.put("description", t.getDescription());
        map.put("category", t.getCategory());
        map.put("amount", t.getAmount());
        map.put("date", t.getDate() != null ? t.getDate().toString() : java.time.LocalDate.now().toString());
        map.put("merchant", t.getMerchant() != null ? t.getMerchant() : "");
        map.put("type", t.getType() != null ? t.getType() : "EXPENSE");
        return map;
    }


    private MlCategorizeResponseDTO fallbackCategorize(String text) {
        String lower = text != null ? text.toLowerCase() : "";
        String cat = "shopping";
        String disp = "Shopping";

        if (lower.contains("salary") || lower.contains("payroll") || lower.contains("stipend") || lower.contains("wages")) {
            cat = "salary";
            disp = "Salary / Wages";
        } else if (lower.contains("freelance") || lower.contains("consulting")) {
            cat = "freelance";
            disp = "Freelance & Consulting";
        } else if (lower.contains("hospital") || lower.contains("pharmacy") || lower.contains("doctor") || lower.contains("medical") 
                || lower.contains("fever") || lower.contains("cough") || lower.contains("cold") || lower.contains("medicine") 
                || lower.contains("paracetamol") || lower.contains("dolo") || lower.contains("tablet") || lower.contains("clinic")) {
            cat = "healthcare";
            disp = "Healthcare";
        } else if (lower.contains("uber") || lower.contains("ola") || lower.contains("ticket") || lower.contains("flight") || lower.contains("hotel") || lower.contains("petrol") || lower.contains("fuel") || lower.contains("fastag")) {
            cat = "travel";
            disp = "Travel & Commute";
        } else if (lower.contains("zomato") || lower.contains("swiggy") || lower.contains("pizza") || lower.contains("restaurant") || lower.contains("coffee") || lower.contains("grocery") || lower.contains("food")) {
            cat = "food";
            disp = "Food & Dining";
        } else if (lower.contains("emi") || lower.contains("loan") || lower.contains("credit card")) {
            cat = "emi";
            disp = "Loan & EMI";
        } else if (lower.contains("netflix") || lower.contains("movie") || lower.contains("concert") || lower.contains("game") || lower.contains("spotify")) {
            cat = "entertainment";
            disp = "Entertainment";
        } else if (lower.contains("bill") || lower.contains("recharge") || lower.contains("water") || lower.contains("gas") || lower.contains("electricity") || lower.contains("wifi")) {
            cat = "utilities";
            disp = "Utilities & Bills";
        } else if (lower.contains("sip") || lower.contains("crypto") || lower.contains("stock") || lower.contains("deposit") || lower.contains("mutual fund")) {
            cat = "investment";
            disp = "Investments";
        } else if (lower.contains("college") || lower.contains("exam") || lower.contains("library") || lower.contains("course") || lower.contains("tuition") || lower.contains("school")) {
            cat = "education";
            disp = "Education";
        }

        return MlCategorizeResponseDTO.builder()
                .category(cat)
                .displayCategory(disp)
                .confidence(0.95)
                .suggestedTags(List.of(cat))
                .build();
    }

    private MlAnomalyResponseDTO fallbackAnomaly(Transaction current) {
        boolean isAnomaly = current.getAmount() != null && current.getAmount() > 35000.0 && !"investment".equalsIgnoreCase(current.getCategory()) && !"emi".equalsIgnoreCase(current.getCategory());
        return MlAnomalyResponseDTO.builder()
                .isAnomaly(isAnomaly)
                .anomalyScore(isAnomaly ? 0.85 : 0.1)
                .reason(isAnomaly ? "Unusually high single expense recorded above standard threshold." : "Normal transaction within parameters.")
                .confidence(0.88)
                .expectedRange(Map.of("min", 100.0, "max", 25000.0, "avg", 3500.0))
                .build();
    }

    private MlForecastResponseDTO fallbackForecast(Double budget, List<Transaction> transactions) {
        double currentSpend = transactions.stream()
                .filter(t -> !"INCOME".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();
        double targetBudget = budget != null ? budget : 50000.0;
        int day = LocalDateNowDay();
        double burnRate = day > 0 ? (currentSpend / day) : 0.0;
        double projected = currentSpend + (burnRate * (30 - day));

        return MlForecastResponseDTO.builder()
                .currentSpend(currentSpend)
                .projectedEndOfMonth(projected)
                .budgetVariance(targetBudget - projected)
                .burnRateDaily(burnRate)
                .isOverbudgetRisk(projected > targetBudget)
                .confidenceLevel("Moderate")
                .forecastPoints(new ArrayList<>())
                .build();
    }

    private MlRecommendationResponseDTO fallbackRecommendations(Double income, List<Transaction> transactions, List<Budget> budgets) {
        double inc = income != null ? income : 0.0;
        double totalSpend = 0.0;
        Map<String, Double> spendByCat = new HashMap<>();

        if (transactions != null) {
            for (Transaction t : transactions) {
                if (!"INCOME".equalsIgnoreCase(t.getType())) {
                    double amt = t.getAmount() != null ? t.getAmount() : 0.0;
                    totalSpend += amt;
                    String cat = t.getCategory() != null ? t.getCategory().toLowerCase() : "miscellaneous";
                    spendByCat.put(cat, spendByCat.getOrDefault(cat, 0.0) + amt);
                }
            }
        }

        double savingsRate = inc > 0 ? Math.max(0.0, ((inc - totalSpend) / inc) * 100.0) : 0.0;
        List<Map<String, Object>> recs = new ArrayList<>();
        List<String> summaryInsights = new ArrayList<>();

        if (inc > 0 && totalSpend > inc) {
            double deficit = totalSpend - inc;
            Map<String, Object> r = new HashMap<>();
            r.put("id", UUID.randomUUID().toString());
            r.put("type", "WARNING");
            r.put("severity", "CRITICAL");
            r.put("title", "Cash Flow Deficit Alert: -₹" + String.format("%.0f", deficit) + " Overspend");
            r.put("message", "Your spending (₹" + String.format("%.0f", totalSpend) + ") exceeds your income (₹" + String.format("%.0f", inc) + ") by ₹" + String.format("%.0f", deficit) + ". Immediate spending freeze recommended.");
            r.put("potential_savings", deficit);
            r.put("action", "Freeze Discretionary Spend");
            recs.add(r);
            summaryInsights.add("Spending exceeds monthly income by ₹" + String.format("%.0f", deficit) + ".");
        } else if (inc > 0 && totalSpend == inc) {
            Map<String, Object> r = new HashMap<>();
            r.put("id", UUID.randomUUID().toString());
            r.put("type", "WARNING");
            r.put("severity", "HIGH");
            r.put("title", "Zero Savings Alert: 100% Income Depleted");
            r.put("message", "You have spent 100% of your ₹" + String.format("%.0f", inc) + " income with ₹0 remaining. Build an emergency cushion.");
            r.put("potential_savings", inc * 0.15);
            r.put("action", "Build Emergency Buffer");
            recs.add(r);
        }

        if (budgets != null) {
            for (Budget b : budgets) {
                String cat = b.getCategory() != null ? b.getCategory().toLowerCase() : "";
                double allocated = b.getAllocatedAmount() != null ? b.getAllocatedAmount() : 0.0;
                double spent = spendByCat.getOrDefault(cat, b.getSpentAmount() != null ? b.getSpentAmount() : 0.0);
                if (allocated > 0 && spent >= allocated) {
                    double over = spent - allocated;
                    Map<String, Object> r = new HashMap<>();
                    r.put("id", UUID.randomUUID().toString());
                    r.put("type", "WARNING");
                    r.put("severity", "HIGH");
                    String disp = b.getDisplayCategory() != null ? b.getDisplayCategory() : cat;
                    r.put("title", "Budget Exceeded in " + disp);
                    r.put("message", "Exceeded limit by ₹" + String.format("%.0f", over) + " (spent ₹" + String.format("%.0f", spent) + " of ₹" + String.format("%.0f", allocated) + ").");
                    r.put("potential_savings", over);
                    r.put("action", "Adjust " + disp + " Budget");
                    recs.add(r);
                }
            }
        }

        int score = 0;
        if (inc > 0) {
            if (totalSpend > inc) score += 0;
            else if (savingsRate >= 25) score += 35;
            else if (savingsRate >= 15) score += 25;
            else if (savingsRate >= 5) score += 15;
            else if (savingsRate > 0) score += 5;
            else score += 2;
        } else {
            score += 15;
        }

        double totalBudget = budgets != null ? budgets.stream().mapToDouble(b -> b.getAllocatedAmount() != null ? b.getAllocatedAmount() : 0.0).sum() : 0.0;
        if (totalBudget > 0) {
            double util = (totalSpend / totalBudget) * 100.0;
            if (util <= 85) score += 35;
            else if (util <= 100) score += 25;
            else if (util <= 115) score += 10;
        } else {
            score += 20;
        }
        score += 25;
        score = Math.max(0, Math.min(100, score));

        String status = score >= 80 ? "Excellent" : score >= 65 ? "Good" : score >= 50 ? "Fair" : "Needs Attention";

        return MlRecommendationResponseDTO.builder()
                .healthScore(score)
                .healthStatus(status)
                .savingsRate(Math.round(savingsRate * 10.0) / 10.0)
                .recommendations(recs)
                .summaryInsights(summaryInsights)
                .build();
    }
}
