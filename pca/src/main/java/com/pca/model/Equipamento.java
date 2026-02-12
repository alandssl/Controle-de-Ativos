package com.pca.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Data
@Entity
@SuperBuilder
@Getter
@Setter
@AllArgsConstructor
@Table(name = "equipamentos")
public class Equipamento {

    public Equipamento() {
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacionamento com tipoEstado
    @ManyToOne
    @JoinColumn(name = "estado", referencedColumnName = "estado_tipo")
    private TipoEstado estado;

    // Relacionamento com tipoEquipamento
    @ManyToOne
    @JoinColumn(name = "tipo_equipamento", referencedColumnName = "tipo")
    private TipoEquipamento tipoEquipamento;

    // Relacionamento com NFs
    @ManyToOne
    @com.fasterxml.jackson.annotation.JsonBackReference
    @JoinColumn(name = "nota_fiscal_id", referencedColumnName = "id")
    private NotaFiscal notaFiscal;

    @Column(length = 50)
    private String fabricante;

    @Column(length = 50, unique = true)
    private String etiqueta;

    @Column(name = "TEC", length = 50)
    private String tec;

    @Column(length = 50, nullable = false, unique = true)
    private String patrimonio;

    @Column(length = 50)
    private String modelo;

    @Column(name = "GPU", length = 50)
    private String gpu;

    @Column(name = "tipo_ram", length = 50)
    private String tipoRam;

    @Column(name = "quantidade_ram")
    private Integer quantidadeRam;

    @Column(name = "tipo_armazenamento", length = 50)
    private String tipoArmazenamento;

    @Column(name = "quantidade_armazenamento")
    private Integer quantidadeArmazenamento;

    @Column(name = "Descricao", length = 255)
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "status")
    private Status status;

    @Column
    private String categoria;

    @Column(precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_aquisição")
    private LocalDateTime data_aquisicao;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "update_at")
    private LocalDateTime updateAt;

    @Column(name = "exluded_at")
    private LocalDateTime excludedAt;

    @Column(name = "imei_celular")
    private String imeiCelular;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updateAt = LocalDateTime.now();
    }

}
