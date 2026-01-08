package com.pca.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;


@Entity
@Table(name="status")
@AllArgsConstructor
@NoArgsConstructor
public class Status {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column
    private String descricao; //Ativo, inativo, manutenção

    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt;

    @Column(name="update_at")
    private LocalDateTime updateAt;

    @Column(name="exluded_at")
    private LocalDateTime excludedAt;


}
