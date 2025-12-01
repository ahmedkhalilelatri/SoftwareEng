package com.finanote.controller;

import com.finanote.model.User;
import com.finanote.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "monthlyBudget", user.getMonthlyBudget()
        ));
    }

    @PutMapping("/budget")
    public ResponseEntity<Map<String, Object>> updateBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Double> request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        User updatedUser = userService.updateBudget(user.getId(), request.get("budget"));
        return ResponseEntity.ok(Map.of(
                "id", updatedUser.getId(),
                "monthlyBudget", updatedUser.getMonthlyBudget()
        ));
    }
}
