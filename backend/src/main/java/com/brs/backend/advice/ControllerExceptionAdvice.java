package com.brs.backend.advice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.sql.SQLIntegrityConstraintViolationException;

@ControllerAdvice
@Slf4j
public class ControllerExceptionAdvice extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = {MethodArgumentTypeMismatchException.class})
    protected ResponseEntity<Object> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request)
    {

        String bodyOfResponse = ex.getMessage();
        log.error("Request [{}] failed with method argument error with message {}", request.getContextPath(), bodyOfResponse, ex);
        return handleExceptionInternal(ex, bodyOfResponse,
                new HttpHeaders(), HttpStatus.UNPROCESSABLE_ENTITY, request);
    }

    @ExceptionHandler(value = {IllegalArgumentException.class})
    protected ResponseEntity<Object> handleIllegalArgumentTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request)
    {

        String bodyOfResponse = ex.getMessage();
        log.error("Request [{}] failed with method argument error with message {}", request.getContextPath(), bodyOfResponse, ex);
        return handleExceptionInternal(ex, bodyOfResponse,
                new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(value = {DataIntegrityViolationException.class, SQLIntegrityConstraintViolationException.class})
    protected ResponseEntity<Object> handleDuplicates(RuntimeException ex, WebRequest request)
    {
        String bodyOfResponse = ex.getMessage();
        log.error("Request [{}] failed with SQL error with message {}", request.getContextPath(), bodyOfResponse, ex);
        return handleExceptionInternal(ex, bodyOfResponse,
                new HttpHeaders(), HttpStatus.CONFLICT, request);
    }

    @ExceptionHandler(value = {AccessDeniedException.class})
    protected ResponseEntity<Object> handleAccessdeniedException(RuntimeException ex, WebRequest request)
    {
        String bodyOfResponse = ex.getMessage();
        log.error("Request [{}] failed with error message {}", request.getContextPath(), bodyOfResponse, ex);
        return handleExceptionInternal(ex, bodyOfResponse,
                new HttpHeaders(), HttpStatus.FORBIDDEN, request);
    }


    @ExceptionHandler(value = {RuntimeException.class})
    protected ResponseEntity<Object> handleRuntimeException(RuntimeException ex, WebRequest request)
    {
        String bodyOfResponse = ex.getMessage();
        log.error("Request [{}] failed with error message {}", request.getContextPath(), bodyOfResponse, ex);
        return handleExceptionInternal(ex, bodyOfResponse,
                new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

}
