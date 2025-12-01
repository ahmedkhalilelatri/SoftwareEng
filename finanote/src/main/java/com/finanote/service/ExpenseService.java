package com.finanote.service;

import com.finanote.dto.DashboardStats;
import com.finanote.dto.ExpenseRequest;
import com.finanote.dto.ExpenseResponse;
import com.finanote.model.Category;
import com.finanote.model.Expense;
import com.finanote.model.User;
import com.finanote.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserService userService;

    public ExpenseService(ExpenseRepository expenseRepository, UserService userService) {
        this.expenseRepository = expenseRepository;
        this.userService = userService;
    }

    public ExpenseResponse createExpense(Long userId, ExpenseRequest request) {
        User user = userService.getUserById(userId);

        Expense expense = new Expense();
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setNotes(request.getNotes());
        expense.setUser(user);

        Expense savedExpense = expenseRepository.save(expense);
        return ExpenseResponse.fromExpense(savedExpense);
    }

    public List<ExpenseResponse> getAllExpenses(Long userId) {
        return expenseRepository.findByUserIdOrderByExpenseDateDesc(userId)
                .stream()
                .map(ExpenseResponse::fromExpense)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByMonth(Long userId, int year, int month) {
        return expenseRepository.findByUserIdAndMonth(userId, year, month)
                .stream()
                .map(ExpenseResponse::fromExpense)
                .collect(Collectors.toList());
    }

    public ExpenseResponse getExpenseById(Long userId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to expense");
        }

        return ExpenseResponse.fromExpense(expense);
    }

    public ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to expense");
        }

        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setNotes(request.getNotes());

        Expense updatedExpense = expenseRepository.save(expense);
        return ExpenseResponse.fromExpense(updatedExpense);
    }

    public void deleteExpense(Long userId, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to expense");
        }

        expenseRepository.delete(expense);
    }

    public DashboardStats getDashboardStats(Long userId, int year, int month) {
        User user = userService.getUserById(userId);
        DashboardStats stats = new DashboardStats();

        // Get total expenses for the month
        Double totalExpenses = expenseRepository.getTotalExpensesByMonth(userId, year, month);
        totalExpenses = totalExpenses != null ? totalExpenses : 0.0;
        stats.setTotalExpenses(totalExpenses);

        // Budget info
        Double monthlyBudget = user.getMonthlyBudget();
        stats.setMonthlyBudget(monthlyBudget);
        stats.setRemainingBudget(monthlyBudget - totalExpenses);
        stats.setBudgetPercentage(monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0);

        // Expenses by category
        List<Object[]> categoryData = expenseRepository.getExpensesByCategory(userId, year, month);
        Map<String, Double> expensesByCategory = new LinkedHashMap<>();
        Map<String, String> categoryColors = new LinkedHashMap<>();

        for (Object[] row : categoryData) {
            Category category = (Category) row[0];
            Double amount = (Double) row[1];
            expensesByCategory.put(category.getDisplayName(), amount);
            categoryColors.put(category.getDisplayName(), category.getColor());
        }
        stats.setExpensesByCategory(expensesByCategory);
        stats.setCategoryColors(categoryColors);

        // Daily expenses
        List<Object[]> dailyData = expenseRepository.getDailyExpenses(userId, year, month);
        List<DashboardStats.DailyExpense> dailyExpenses = new ArrayList<>();
        for (Object[] row : dailyData) {
            int day = (Integer) row[0];
            Double amount = (Double) row[1];
            dailyExpenses.add(new DashboardStats.DailyExpense(day, amount));
        }
        stats.setDailyExpenses(dailyExpenses);

        // Total transactions
        List<Expense> monthlyExpenses = expenseRepository.findByUserIdAndMonth(userId, year, month);
        stats.setTotalTransactions(monthlyExpenses.size());

        return stats;
    }

    public List<ExpenseResponse> getExpensesByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserIdAndExpenseDateBetween(userId, startDate, endDate)
                .stream()
                .map(ExpenseResponse::fromExpense)
                .collect(Collectors.toList());
    }
}
