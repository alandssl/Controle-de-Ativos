package com.pca.model;

import java.time.LocalDateTime;

import com.pca.enums.AnexoStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "movimentos")
public class Movimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_movimento")
    private String tipoMovimento; // "ENTRADA" or "SAIDA"

    @Column(name = "observacao")
    private String observacao;

    @Column(name = "valor")
    private Double valor;

    @Column(name = "data_movimento")
    private LocalDateTime dataMovimento;

    @ManyToOne
    @JoinColumn(name = "tipo")
    private TipoEquipamento tipo;

    @ManyToOne
    @JoinColumn(name = "id_ativo")
    private Equipamento equipamento;

    @Column(name = "cod_movimento")
    private String codMovimento;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_anexo")
    private AnexoStatus anexo;

    @ManyToOne
    @JoinColumn(name = "id_colaborador")
    private Colaborador colaborador;

    @Column(name = "setor", length = 50)
    private String setor;

     @Column(name = "nome_arquivo")
    private String nomeArquivo;

    @Column(name = "caminho_arquivo")
    private String caminhoArquivo;

    @Column(name = "tipo_arquivo")
    private String tipoArquivo;

    @Column(name = "tamanho_arquivo")
    private Long tamanhoArquivo;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "update_at")
    private LocalDateTime updateAt;

    @Column(name = "excluded_at")
    private LocalDateTime excludedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updateAt = LocalDateTime.now();
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTipoMovimento() {
        return tipoMovimento;
    }

    public void setTipoMovimento(String tipoMovimento) {
        this.tipoMovimento = tipoMovimento;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public LocalDateTime getDataMovimento() {
        return dataMovimento;
    }

    public void setDataMovimento(LocalDateTime dataMovimento) {
        this.dataMovimento = dataMovimento;
    }

    public TipoEquipamento getTipo() {
        return tipo;
    }

    public void setTipo(TipoEquipamento tipo) {
        this.tipo = tipo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdateAt() {
        return updateAt;
    }

    public LocalDateTime getExcludedAt() {
        return excludedAt;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public Equipamento getIdEquipamento() {
        return equipamento;
    }

    public void setIdEquipamento(Equipamento equipamento) {
        this.equipamento = equipamento;
    }

    public Colaborador getIdColaborador() {
        return colaborador;
    }

    public void setIdColaborador(Colaborador colaborador) {
        this.colaborador = colaborador;
    }

    public String getSetor() {
        return setor;
    }

    public void setSetor(String setor) {
        this.setor = setor;
    }

    public String getCodMovimento() {
        return codMovimento;
    }

    public void setCodMovimento(String codMovimento) {
        this.codMovimento = codMovimento;
    }

    public AnexoStatus getAnexo() {
        return anexo;
    }

    public void setAnexo(AnexoStatus anexo) {
        this.anexo = anexo;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public void setNomeArquivo(String nomeArquivo) {
        this.nomeArquivo = nomeArquivo;
    }

    public String getCaminhoArquivo() {
        return caminhoArquivo;
    }

    public void setCaminhoArquivo(String caminhoArquivo) {
        this.caminhoArquivo = caminhoArquivo;
    }

    public String getTipoArquivo() {
        return tipoArquivo;
    }

    public void setTipoArquivo(String tipoArquivo) {
        this.tipoArquivo = tipoArquivo;
    }

    public Long getTamanhoArquivo() {
        return tamanhoArquivo;
    }

    public void setTamanhoArquivo(Long tamanhoArquivo) {
        this.tamanhoArquivo = tamanhoArquivo;
    }

}