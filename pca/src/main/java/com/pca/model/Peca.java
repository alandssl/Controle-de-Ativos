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
import lombok.NoArgsConstructor;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;


@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name="peca")
public class Peca {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false,length=100)
    private String descricao;

    @Column
    private String observacao;

    @ManyToOne
    @JoinColumn(name="id_sucata", referencedColumnName="id")
    private EquipamentoSucata sucata;

    @ManyToOne
    @JoinColumn(name="id_iem_nf", referencedColumnName="id")
    private ItemNF itemNF;

    @Column(nullable=false)
    private Boolean disponivel;

    @Column(name="data_retirada")
    private LocalDateTime dataRetirada;

    @Column(name ="created_at", nullable=false)
    private LocalDateTime createdAt;

    @Column(name="update_at")
    private LocalDateTime updateAt;

    @Column(name="exluded_at")
    private LocalDateTime excludedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

    }

    @PreUpdate
    public void preUpdate() {
        this.updateAt = LocalDateTime.now();
    }


}