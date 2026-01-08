package com.pca.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "equipamento_sucata")
public class EquipamentoSucata {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id; 

    @ManyToOne
    @JoinColumn(name="id_equipamento", referencedColumnName="id")
    private Equipamento equipamento;
    
    @Column(name= "created_at", nullable= false)
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @Column(name="excluded_at")
    private LocalDateTime excludedAt;

    public Long getId(){
        return id;
    }

    public Equipamento getDescricao(){
        return equipamento;
    }

    public void setDescricao(Equipamento descricao){
        this.equipamento = descricao;
    }

    public LocalDateTime getCreatedAt(){
        return createdAt;
    }


    public LocalDateTime getUpdateAt(){
        return updatedAt;
    }

    public void setUpdateAt(LocalDateTime updatedAt){
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getExcludedAt(){
        return excludedAt;
    }




}
