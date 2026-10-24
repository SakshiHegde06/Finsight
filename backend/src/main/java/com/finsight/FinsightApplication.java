package com.finsight;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FinsightApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinsightApplication.class, args);
        System.out.println("==================================================");
        System.out.println("🚀 FinSight Backend API is running on port 8080");
        System.out.println("📊 Swagger / Endpoints available for Frontend & ML");
        System.out.println("==================================================");
    }
}
