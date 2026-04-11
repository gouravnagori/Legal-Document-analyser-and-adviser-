package com.legal.repository;

import com.legal.model.AnalysisRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnalysisRepository extends MongoRepository<AnalysisRecord, String> {
    List<AnalysisRecord> findAllByOrderByAnalyzedAtDesc();
    List<AnalysisRecord> findByUserIdOrderByAnalyzedAtDesc(String userId);
    Optional<AnalysisRecord> findByIdAndUserId(String id, String userId);
    void deleteByIdAndUserId(String id, String userId);
}
