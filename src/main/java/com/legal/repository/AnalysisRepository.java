package com.legal.repository;

import com.legal.model.AnalysisRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisRepository extends MongoRepository<AnalysisRecord, String> {
    List<AnalysisRecord> findAllByOrderByAnalyzedAtDesc();
}
