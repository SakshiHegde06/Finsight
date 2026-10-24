package com.finsight.repository;

import com.finsight.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {

    List<Transaction> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);

    List<Transaction> findByCategoryOrderByDateDesc(String category);

    List<Transaction> findByTypeOrderByDateDesc(String type);

    List<Transaction> findByIsAnomalyTrueOrderByDateDesc();

    long countByIsAnomalyTrue();
    
    List<Transaction> findAllByOrderByDateDesc();
}
