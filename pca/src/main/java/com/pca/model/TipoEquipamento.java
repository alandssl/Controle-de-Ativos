package com.pca.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tipoEquipamento")
public class TipoEquipamento {
    
    @Id
    @Column(name = "tipo", length = 50)
    private String tipo; //NOTEBOOK, DESKTOP, ETC

    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt;

    @Column(name="update_at")
    private LocalDateTime updateAt;

    @Column(name="exluded_at")
    private LocalDateTime excludedAt;

    public String getTipo(){
        return tipo;
    }
    
}