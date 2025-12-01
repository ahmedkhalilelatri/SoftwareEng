package com.finanote.dto;

import com.finanote.model.Category;
import com.finanote.model.Expense;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExpenseResponse {
    private Long id;
    private String description;
    private Double amount;
    private Category category;
    private String categoryDisplayName;
    private String categoryColor;
    private LocalDate expenseDate;
    private String notes;

    public static ExpenseResponse fromExpense(Expense expense) {
        ExpenseResponse response = new ExpenseResponse();
        response.setId(expense.getId());
        response.setDescription(expense.getDescription());
        response.setAmount(expense.getAmount());
        response.setCategory(expense.getCategory());
        response.setCategoryDisplayName(expense.getCategory().getDisplayName());
        response.setCategoryColor(expense.getCategory().getColor());
        response.setExpenseDate(expense.getExpenseDate());
        response.setNotes(expense.getNotes());
        return response;
    }
}
