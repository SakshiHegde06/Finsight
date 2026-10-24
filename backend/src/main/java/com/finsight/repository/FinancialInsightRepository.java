package com.finsight.repository;

import com.finsight.model.FinancialInsight;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinancialInsightRepository extends MongoRepository<FinancialInsight, String> {

    List<FinancialInsight> findAllByOrderByCreatedAtDesc();
}
