package com.finsight.config;

import com.mongodb.ConnectionString;
import com.mongodb.WriteConcern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.uri:}")
    private String rawUri;

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoClientSettingsBuilderCustomizer() {
        return clientSettingsBuilder -> {
            if (rawUri != null && !rawUri.isBlank()) {
                String cleanUri = rawUri.trim().replaceAll("\\s+", "");
                log.info("[*] Sanitized MongoDB connection URI (stripped trailing newlines/spaces)");
                clientSettingsBuilder.applyConnectionString(new ConnectionString(cleanUri));
            }
            clientSettingsBuilder.writeConcern(WriteConcern.MAJORITY);
        };
    }
}
