package com.d1nvan.jdeepwiki.exception;

import com.d1nvan.jdeepwiki.model.R;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

@ControllerAdvice
@ResponseBody
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public R<String> handleException(Exception e) {
        return R.fail(500, e.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public R<String> handleRuntimeException(RuntimeException e) {
        return R.fail(400, e.getMessage());
    }
}