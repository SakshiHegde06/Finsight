package com.finsight.controller;

import com.finsight.dto.BudgetRequest;
import com.finsight.model.Budget;
import com.finsight.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<Budget>> getBudgets(
            @RequestParam(required = false) String monthYear) {
        return ResponseEntity.ok(budgetService.getBudgetsForMonth(monthYear));
    }

    @PostMapping
    public ResponseEntity<Budget> createOrUpdateBudget(@Valid @RequestBody BudgetRequest request) {
        Budget budget = budgetService.createOrUpdateBudget(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(budget);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable String id) {
        if (budgetService.deleteBudget(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/recalculate")
    public ResponseEntity<Map<String, String>> recalculate(
            @RequestParam(required = false) String monthYear) {
        budgetService.recalculateBudgetSpending(monthYear);
        return ResponseEntity.ok(Map.of("message", "Budgets recalculated successfully"));
    }
}
