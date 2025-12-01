package com.finanote.controller;

import com.finanote.dto.DashboardStats;
import com.finanote.dto.ExpenseRequest;
import com.finanote.dto.ExpenseResponse;
import com.finanote.model.Category;
import com.finanote.model.User;
import com.finanote.service.ExpenseService;
import com.finanote.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserService userService;

    public ExpenseController(ExpenseService expenseService, UserService userService) {
        this.expenseService = expenseService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ExpenseRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        ExpenseResponse response = expenseService.createExpense(user.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAllExpenses(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        List<ExpenseResponse> expenses = expenseService.getAllExpenses(user.getId());
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/month")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByMonth(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam int year,
            @RequestParam int month) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        List<ExpenseResponse> expenses = expenseService.getExpensesByMonth(user.getId(), year, month);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        ExpenseResponse response = expenseService.getExpenseById(user.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        ExpenseResponse response = expenseService.updateExpense(user.getId(), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        expenseService.deleteExpense(user.getId(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        User user = userService.getUserByEmail(userDetails.getUsername());

        if (year == null) year = LocalDate.now().getYear();
        if (month == null) month = LocalDate.now().getMonthValue();

        DashboardStats stats = expenseService.getDashboardStats(user.getId(), year, month);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, String>>> getCategories() {
        List<Map<String, String>> categories = Arrays.stream(Category.values())
                .map(c -> Map.of(
                        "name", c.name(),
                        "displayName", c.getDisplayName(),
                        "color", c.getColor()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }
}
