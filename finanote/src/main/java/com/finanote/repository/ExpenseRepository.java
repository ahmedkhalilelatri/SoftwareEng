package com.finanote.repository;

import com.finanote.model.Category;
import com.finanote.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserIdOrderByExpenseDateDesc(Long userId);

    List<Expense> findByUserIdAndCategory(Long userId, Category category);

    List<Expense> findByUserIdAndExpenseDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND " +
           "YEAR(e.expenseDate) = :year AND MONTH(e.expenseDate) = :month " +
           "ORDER BY e.expenseDate DESC")
    List<Expense> findByUserIdAndMonth(@Param("userId") Long userId,
                                        @Param("year") int year,
                                        @Param("month") int month);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND " +
           "YEAR(e.expenseDate) = :year AND MONTH(e.expenseDate) = :month")
    Double getTotalExpensesByMonth(@Param("userId") Long userId,
                                   @Param("year") int year,
                                   @Param("month") int month);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND " +
           "YEAR(e.expenseDate) = :year AND MONTH(e.expenseDate) = :month " +
           "GROUP BY e.category")
    List<Object[]> getExpensesByCategory(@Param("userId") Long userId,
                                          @Param("year") int year,
                                          @Param("month") int month);

    @Query("SELECT DAY(e.expenseDate), SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND " +
           "YEAR(e.expenseDate) = :year AND MONTH(e.expenseDate) = :month " +
           "GROUP BY DAY(e.expenseDate) ORDER BY DAY(e.expenseDate)")
    List<Object[]> getDailyExpenses(@Param("userId") Long userId,
                                     @Param("year") int year,
                                     @Param("month") int month);
}
