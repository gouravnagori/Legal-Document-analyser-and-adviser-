package com.legal.controller;

import com.legal.model.User;
import com.legal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    // ===== SIGN UP =====
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name is required."));
        }
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required."));
        }
        if (password == null || password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters."));
        }

        if (userRepository.existsByEmail(email.trim().toLowerCase())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "An account with this email already exists."));
        }

        User user = new User();
        user.setName(name.trim());
        user.setEmail(email.trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Account created successfully! Please sign in.",
                "name", user.getName()
        ));
    }

    // ===== SIGN IN =====
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email.trim().toLowerCase(), password)
            );

            SecurityContextHolder.getContext().setAuthentication(auth);
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            User user = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
            String userName = user != null ? user.getName() : "User";

            return ResponseEntity.ok(Map.of(
                    "message", "Signed in successfully!",
                    "name", userName,
                    "email", email.trim().toLowerCase()
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password."));
        }
    }

    // ===== GET CURRENT USER =====
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("authenticated", false));
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("authenticated", false));
        }

        return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "name", user.getName(),
                "email", user.getEmail()
        ));
    }
}
