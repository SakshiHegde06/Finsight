package com.finsight.repository;

import com.finsight.model.Budget;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends MongoRepository<Budget, String> {

    List<Budget> findByMonthYear(String monthYear);

    List<Budget> findByCategoryAndMonthYear(String category, String monthYear);
}
