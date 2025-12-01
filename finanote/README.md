# Finanote

Student Expense Tracker Application

## Overview

Finanote is a web-based expense tracking application designed to help students manage their finances. It allows users to track expenses, manage budgets, and view spending habits.

## Features

-   **User Management**: Secure user registration and login using JWT authentication.
-   **Expense Tracking**: Add, view, and manage daily expenses.
-   **Budgeting**: Set and monitor monthly budgets.
-   **Categorization**: Organize expenses by categories.
-   **Dashboard**: View summaries and insights into spending.

## Technology Stack

-   **Backend**: Java 21, Spring Boot 3.2.0
-   **Database**: H2 Database (In-memory)
-   **Security**: Spring Security, JWT (JSON Web Tokens)
-   **Frontend**: Thymeleaf, HTML, CSS, JavaScript
-   **Build Tool**: Maven

## Prerequisites

-   Java Development Kit (JDK) 21
-   Maven 3.8+

## Installation and Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd finanote
    ```

2.  **Build the application:**
    ```bash
    mvn clean install
    ```

3.  **Run the application:**
    ```bash
    mvn spring-boot:run
    ```

4.  **Access the application:**
    Open your browser and navigate to `http://localhost:8080`.

## API Endpoints

### Authentication
-   `POST /api/auth/register`: Register a new user
-   `POST /api/auth/login`: Authenticate and receive a JWT

### Expenses
-   `GET /api/expenses`: Get all expenses
-   `POST /api/expenses`: Add a new expense
-   `GET /api/expenses/{id}`: Get expense by ID
-   `PUT /api/expenses/{id}`: Update an expense
-   `DELETE /api/expenses/{id}`: Delete an expense

### Users
-   `GET /api/users/me`: Get current user profile
