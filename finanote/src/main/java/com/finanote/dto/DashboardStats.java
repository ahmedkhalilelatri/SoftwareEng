package com.finanote.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class DashboardStats {
    private Double totalExpenses;
    private Double monthlyBudget;
    private Double remainingBudget;
    private Double budgetPercentage;
    private Map<String, Double> expensesByCategory;
    private Map<String, String> categoryColors;
    private List<DailyExpense> dailyExpenses;
    private int totalTransactions;

    @Data
    public static class DailyExpense {
        private int day;
        private Double amount;

        public DailyExpense(int day, Double amount) {
            this.day = day;
            this.amount = amount;
        }
    }
}
