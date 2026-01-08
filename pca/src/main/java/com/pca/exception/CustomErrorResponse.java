package com.pca.exception;

import java.time.LocalDateTime;

public class CustomErrorResponse {
  
    private int status;
    private String message;
    private LocalDateTime timestamp;

    public CustomErrorResponse(){
    };

    public CustomErrorResponse(int status, String message, LocalDateTime timestamp){
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
    }
    
    public int getStatus(){
        return status;
    }

    public void setStatus(int status){
        this.status = status;
    }

    public String getMessage(){
        return message;
    }

    public void setMessage (String message){
        this.message = message;
    }

    public LocalDateTime getTimeStamp(){
        return timestamp;
    }

    public void setTimeStamp(LocalDateTime timestamp){
        this.timestamp = timestamp;
    }

}
