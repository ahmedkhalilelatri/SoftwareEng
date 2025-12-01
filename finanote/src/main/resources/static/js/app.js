// Finanote - Student Expense Tracker App

// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

// API Configuration
const API_BASE = '/api';
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// Global variables
let categoryChart = null;
let dailyChart = null;
let categories = [];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Set user name
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('userName').textContent = `Hi, ${userName}`;
    }

    // Initialize month/year selectors
    initializeDateSelectors();

    // Load categories
    await loadCategories();

    // Load dashboard data
    await loadDashboard();
}

function initializeDateSelectors() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');

    // Set current month
    monthSelect.value = currentMonth;

    // Populate years (last 5 years)
    const currentYearNow = new Date().getFullYear();
    for (let year = currentYearNow; year >= currentYearNow - 4; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/expenses/categories`, { headers });
        categories = await response.json();

        // Populate category select
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '<option value="">Select category</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.displayName;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

async function loadDashboard() {
    currentMonth = parseInt(document.getElementById('monthSelect').value);
    currentYear = parseInt(document.getElementById('yearSelect').value);

    try {
        // Load dashboard stats
        const statsResponse = await fetch(
            `${API_BASE}/expenses/dashboard?year=${currentYear}&month=${currentMonth}`,
            { headers }
        );
        const stats = await statsResponse.json();
        updateStats(stats);
        updateCharts(stats);

        // Load expenses list
        const expensesResponse = await fetch(
            `${API_BASE}/expenses/month?year=${currentYear}&month=${currentMonth}`,
            { headers }
        );
        const expenses = await expensesResponse.json();
        updateExpensesList(expenses);
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        showNotification('Failed to load data', 'error');
    }
}

function updateStats(stats) {
    // Total spent
    document.getElementById('totalSpent').textContent = formatCurrency(stats.totalExpenses);
    document.getElementById('transactionCount').textContent = `${stats.totalTransactions} transactions`;

    // Monthly budget with warning emoji
    const budgetText = formatCurrency(stats.monthlyBudget);
    const percentage = Math.min(stats.budgetPercentage, 100);
    
    if (percentage > 80) {
        document.getElementById('monthlyBudget').innerHTML = budgetText + ' <span class="budget-warning-emoji">😠</span>';
    } else {
        document.getElementById('monthlyBudget').textContent = budgetText;
    }

    // Budget progress
    const progressBar = document.getElementById('budgetProgress');
    progressBar.style.width = `${percentage}%`;

    // Update progress bar color
    progressBar.className = 'progress-fill';
    if (percentage > 90) {
        progressBar.classList.add('danger');
    } else if (percentage > 70) {
        progressBar.classList.add('warning');
    } else {
        progressBar.classList.add('safe');
    }

    // Remaining budget
    const remaining = stats.remainingBudget;
    document.getElementById('remainingBudget').textContent = formatCurrency(remaining);
    document.getElementById('remainingPercent').textContent =
        `${Math.max(0, 100 - Math.round(stats.budgetPercentage))}% left`;

    // Update remaining card color
    const remainingCard = document.getElementById('remainingCard');
    remainingCard.className = 'stat-card';
    if (remaining < 0) {
        remainingCard.classList.add('danger');
    } else if (remaining < stats.monthlyBudget * 0.2) {
        remainingCard.classList.add('warning');
    } else {
        remainingCard.classList.add('success');
    }
}

function updateCharts(stats) {
    // Category Pie Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');

    if (categoryChart) {
        categoryChart.destroy();
    }

    const categoryLabels = Object.keys(stats.expensesByCategory);
    const categoryData = Object.values(stats.expensesByCategory);
    const categoryColors = categoryLabels.map(label => stats.categoryColors[label] || '#999999');

    if (categoryData.length > 0) {
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryData,
                    backgroundColor: categoryColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    } else {
        // Show empty state
        categoryCtx.font = '14px Inter';
        categoryCtx.fillStyle = '#64748b';
        categoryCtx.textAlign = 'center';
        categoryCtx.fillText('No expenses yet', categoryCtx.canvas.width / 2, categoryCtx.canvas.height / 2);
    }

    // Daily Spending Line Chart
    const dailyCtx = document.getElementById('dailyChart').getContext('2d');

    if (dailyChart) {
        dailyChart.destroy();
    }

    // Prepare daily data
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const dailyAmounts = new Array(daysInMonth).fill(0);

    stats.dailyExpenses.forEach(item => {
        if (item.day >= 1 && item.day <= daysInMonth) {
            dailyAmounts[item.day - 1] = item.amount;
        }
    });

    const dailyLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    dailyChart = new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: dailyLabels,
            datasets: [{
                label: 'Daily Spending',
                data: dailyAmounts,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => value + ' MAD'
                    }
                },
                x: {
                    ticks: {
                        maxTicksLimit: 10
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: context => formatCurrency(context.raw)
                    }
                }
            }
        }
    });
}

function updateExpensesList(expenses) {
    const list = document.getElementById('expenseList');

    if (expenses.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>No expenses recorded for this month</p>
                <button class="btn btn-primary btn-sm" onclick="openAddExpenseModal()">Add your first expense</button>
            </div>
        `;
        return;
    }

    list.innerHTML = expenses.map(expense => `
        <li class="expense-item">
            <div class="expense-info">
                <div class="expense-category" style="background: ${expense.categoryColor}20; color: ${expense.categoryColor}">
                    ${getCategoryIcon(expense.category)}
                </div>
                <div class="expense-details">
                    <h4>${escapeHtml(expense.description)}</h4>
                    <p>${expense.categoryDisplayName}</p>
                </div>
            </div>
            <div class="expense-amount">
                <div class="amount">${formatCurrency(expense.amount)}</div>
                <div class="date">${formatDate(expense.expenseDate)}</div>
            </div>
            <div class="expense-actions">
                <button class="btn-edit" onclick="editExpense(${expense.id})">Edit</button>
                <button class="btn-delete" onclick="deleteExpense(${expense.id})">Delete</button>
            </div>
        </li>
    `).join('');
}

// Modal functions
function openAddExpenseModal() {
    document.getElementById('modalTitle').textContent = 'Add Expense';
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseId').value = '';
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('expenseModal').classList.add('active');
}

async function editExpense(id) {
    try {
        const response = await fetch(`${API_BASE}/expenses/${id}`, { headers });
        const expense = await response.json();

        document.getElementById('modalTitle').textContent = 'Edit Expense';
        document.getElementById('expenseId').value = expense.id;
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('category').value = expense.category;
        document.getElementById('expenseDate').value = expense.expenseDate;
        document.getElementById('notes').value = expense.notes || '';

        document.getElementById('expenseModal').classList.add('active');
    } catch (error) {
        showNotification('Failed to load expense', 'error');
    }
}

async function saveExpense(e) {
    e.preventDefault();

    const expenseId = document.getElementById('expenseId').value;
    const expenseData = {
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        expenseDate: document.getElementById('expenseDate').value,
        notes: document.getElementById('notes').value
    };

    try {
        const url = expenseId
            ? `${API_BASE}/expenses/${expenseId}`
            : `${API_BASE}/expenses`;

        const response = await fetch(url, {
            method: expenseId ? 'PUT' : 'POST',
            headers,
            body: JSON.stringify(expenseData)
        });

        if (!response.ok) {
            throw new Error('Failed to save expense');
        }

        closeModal();
        showNotification(expenseId ? 'Expense updated' : 'Expense added', 'success');
        loadDashboard();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/expenses/${id}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to delete expense');
        }

        showNotification('Expense deleted', 'success');
        loadDashboard();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function closeModal() {
    document.getElementById('expenseModal').classList.remove('active');
}

// Budget modal
function openBudgetModal() {
    document.getElementById('budgetModal').classList.add('active');
}

function closeBudgetModal() {
    document.getElementById('budgetModal').classList.remove('active');
}

async function saveBudget(e) {
    e.preventDefault();
    const budget = parseFloat(document.getElementById('budgetAmount').value);

    try {
        const response = await fetch(`${API_BASE}/user/budget`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ budget })
        });

        if (!response.ok) {
            throw new Error('Failed to update budget');
        }

        closeBudgetModal();
        showNotification('Budget updated', 'success');
        loadDashboard();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0) + ' MAD';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCategoryIcon(category) {
    const icons = {
        'FOOD': '🥘',
        'TRANSPORT': '🛴',
        'ENTERTAINMENT': '🎪',
        'EDUCATION': '🎓',
        'SHOPPING': '🛒',
        'UTILITIES': '⚡',
        'HEALTH': '🏥',
        'HOUSING': '🏘️',
        'PERSONAL': '🎯',
        'OTHER': '📌'
    };
    return icons[category] || '📌';
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// PDF Export Function
async function exportToPDF() {
    try {
        // Get current data
        const statsResponse = await fetch(
            `${API_BASE}/expenses/dashboard?year=${currentYear}&month=${currentMonth}`,
            { headers }
        );
        const stats = await statsResponse.json();

        const expensesResponse = await fetch(
            `${API_BASE}/expenses/month?year=${currentYear}&month=${currentMonth}`,
            { headers }
        );
        const expenses = await expensesResponse.json();

        // Load jsPDF library
        if (typeof window.jspdf === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            document.head.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Set document properties
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;

        // Title
        doc.setFontSize(24);
        doc.setTextColor(45, 95, 63);
        doc.text('Finanote - Expense Report', pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 15;
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        doc.text(`${monthNames[currentMonth - 1]} ${currentYear}`, pageWidth / 2, yPos, { align: 'center' });

        yPos += 20;

        // Summary Statistics
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary', 20, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text(`Total Spent: ${formatCurrency(stats.totalExpenses)}`, 20, yPos);
        yPos += 7;
        doc.text(`Monthly Budget: ${formatCurrency(stats.monthlyBudget)}`, 20, yPos);
        yPos += 7;
        doc.text(`Remaining: ${formatCurrency(stats.remainingBudget)}`, 20, yPos);
        yPos += 7;
        doc.text(`Budget Used: ${Math.round(stats.budgetPercentage)}%`, 20, yPos);
        yPos += 7;
        doc.text(`Total Transactions: ${stats.totalTransactions}`, 20, yPos);

        yPos += 15;

        // Expenses by Category
        if (Object.keys(stats.expensesByCategory).length > 0) {
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text('Expenses by Category', 20, yPos);
            yPos += 10;

            doc.setFontSize(11);
            for (const [category, amount] of Object.entries(stats.expensesByCategory)) {
                if (yPos > pageHeight - 30) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.setTextColor(60, 60, 60);
                doc.text(`${category}: ${formatCurrency(amount)}`, 20, yPos);
                yPos += 7;
            }
            yPos += 10;
        }

        // Detailed Expenses List
        if (expenses.length > 0) {
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text('Detailed Expenses', 20, yPos);
            yPos += 10;

            expenses.forEach((expense, index) => {
                if (yPos > pageHeight - 40) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                doc.text(`${index + 1}. ${expense.description}`, 20, yPos);
                yPos += 6;
                
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`Category: ${expense.categoryDisplayName}`, 25, yPos);
                yPos += 5;
                doc.text(`Amount: ${formatCurrency(expense.amount)}`, 25, yPos);
                yPos += 5;
                doc.text(`Date: ${formatDate(expense.expenseDate)}`, 25, yPos);
                
                if (expense.notes) {
                    yPos += 5;
                    doc.text(`Notes: ${expense.notes}`, 25, yPos);
                }
                
                yPos += 10;
            });
        }

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

        // Save the PDF
        const fileName = `Finanote_${monthNames[currentMonth - 1]}_${currentYear}.pdf`;
        doc.save(fileName);
        
        showNotification('PDF exported successfully!', 'success');
    } catch (error) {
        console.error('PDF export failed:', error);
        showNotification('Failed to export PDF', 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    window.location.href = '/login.html';
}

// Close modal on overlay click
document.getElementById('expenseModal').addEventListener('click', (e) => {
    if (e.target.id === 'expenseModal') {
        closeModal();
    }
});

document.getElementById('budgetModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'budgetModal') {
        closeBudgetModal();
    }
});
