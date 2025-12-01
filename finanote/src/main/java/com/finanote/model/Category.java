package com.finanote.model;

public enum Category {
    FOOD("Food & Dining", "#FF6384"),
    TRANSPORT("Transportation", "#36A2EB"),
    ENTERTAINMENT("Entertainment", "#FFCE56"),
    EDUCATION("Education & Books", "#4BC0C0"),
    SHOPPING("Shopping", "#9966FF"),
    UTILITIES("Utilities & Bills", "#FF9F40"),
    HEALTH("Health & Medical", "#FF6384"),
    HOUSING("Housing & Rent", "#C9CBCF"),
    PERSONAL("Personal Care", "#7BC8A4"),
    OTHER("Other", "#999999");

    private final String displayName;
    private final String color;

    Category(String displayName, String color) {
        this.displayName = displayName;
        this.color = color;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getColor() {
        return color;
    }
}
