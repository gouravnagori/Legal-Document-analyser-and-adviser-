package com.legal.exception;

import com.legal.model.DocumentAnalysisResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<DocumentAnalysisResponse> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        DocumentAnalysisResponse err = new DocumentAnalysisResponse();
        err.setError("File size exceeds limit! Maximum upload size is 10MB.");
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(err);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<DocumentAnalysisResponse> handleGlobalException(Exception exc) {
        DocumentAnalysisResponse err = new DocumentAnalysisResponse();
        err.setError("An unexpected error occurred: " + exc.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
    }
}
