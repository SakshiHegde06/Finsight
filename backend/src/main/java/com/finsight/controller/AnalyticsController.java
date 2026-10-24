package com.finsight.controller;

import com.finsight.dto.CategorySpendDTO;
import com.finsight.dto.DashboardSummaryDTO;
import com.finsight.dto.MlForecastResponseDTO;
import com.finsight.dto.MonthlyTrendDTO;
import com.finsight.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(
            @RequestParam(required = false) String monthYear) {
        return ResponseEntity.ok(analyticsService.getDashboardSummary(monthYear));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategorySpendDTO>> getCategoryBreakdown(
            @RequestParam(required = false) String monthYear) {
        return ResponseEntity.ok(analyticsService.getCategoryBreakdown(monthYear));
    }

    @GetMapping("/trends")
    public ResponseEntity<List<MonthlyTrendDTO>> getMonthlyTrends(
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(analyticsService.getMonthlyTrends(months));
    }

    @GetMapping("/forecast")
    public ResponseEntity<MlForecastResponseDTO> getSpendingForecast(
            @RequestParam(required = false) String monthYear) {
        return ResponseEntity.ok(analyticsService.getSpendingForecast(monthYear));
    }
}
