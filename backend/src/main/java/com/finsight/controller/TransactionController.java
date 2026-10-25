package com.finsight.controller;

import com.finsight.dto.MlCategorizeResponseDTO;
import com.finsight.dto.TransactionRequest;
import com.finsight.model.Transaction;
import com.finsight.service.MlServiceClient;
import com.finsight.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;
import java.io.PrintWriter;
import java.io.StringWriter;

@Slf4j
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final MlServiceClient mlServiceClient;

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable String id) {
        return transactionService.getTransactionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@Valid @RequestBody TransactionRequest request) {
        try {
            Transaction created = transactionService.createTransaction(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Throwable e) {
            log.error("Failed to create transaction: ", e);
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            String stack = sw.toString();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", e.getClass().getName(),
                "message", e.getMessage() != null ? e.getMessage() : "null",
                "trace", stack.substring(0, Math.min(1000, stack.length()))
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable String id,
            @Valid @RequestBody TransactionRequest request) {
        return transactionService.updateTransaction(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable String id) {
        if (transactionService.deleteTransaction(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<Transaction>> getAnomalies() {
        return ResponseEntity.ok(transactionService.getAnomalies());
    }

    @PostMapping("/anomalies/reanalyze")
    public ResponseEntity<Map<String, Object>> reanalyzeAnomalies() {
        int count = transactionService.reanalyzeAllAnomalies();
        return ResponseEntity.ok(Map.of("message", "Reanalysis complete", "anomaliesDetected", count));
    }

    @PostMapping("/categorize-preview")
    public ResponseEntity<MlCategorizeResponseDTO> previewCategory(@RequestBody Map<String, Object> req) {
        String desc = (String) req.get("description");
        String merchant = (String) req.get("merchant");
        Double amount = req.get("amount") != null ? Double.valueOf(req.get("amount").toString()) : null;
        MlCategorizeResponseDTO response = mlServiceClient.categorize(desc, merchant, amount);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/demo-data")
    public ResponseEntity<Map<String, Object>> clearDemoData() {
        int deleted = transactionService.clearDemoData();
        return ResponseEntity.ok(Map.of("message", "Demo transactions cleared", "deletedCount", deleted));
    }
}
