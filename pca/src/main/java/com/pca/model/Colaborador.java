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
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "colaborador")
public class Colaborador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cod_pessoa", nullable = false)
    private Long codPessoa;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 50)
    private String funcao;

    @Column(nullable = false, unique = true, length = 6)
    private String chapa; // exemplo: "000123"

    @Column(nullable = false, length = 50)
    private String setor;

    @Column(length = 14)
    private String cpf;

    @Column(length = 100)
    private String email;

    @Column(length = 30)
    private String cnpj;

    @Column(length = 50)
    private String situacao;

    @Column(name = "cod_situacao")
    private char codSituacao;

    @Column(name = "data_demissão")
    private LocalDateTime dataDemissao;

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCodPessoa() {
        return codPessoa;
    }

    public void setCodPessoa(Long codPessoa) {
        this.codPessoa = codPessoa;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getFuncao() {
        return funcao;
    }

    public void setFuncao(String funcao) {
        this.funcao = funcao;
    }

    public String getChapa() {
        return chapa;
    }

    public void setChapa(String chapa) {
        this.chapa = chapa;
    }

    public String getSetor() {
        return setor;
    }

    public void setSetor(String setor) {
        this.setor = setor;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }

    public char getCodSituacao() {
        return codSituacao;
    }

    public void setCodSituacao(char codSituacao) {
        this.codSituacao = codSituacao;
    }

    public LocalDateTime getDataDemissao() {
        return dataDemissao;
    }

    public void setDataDemissao(LocalDateTime dataDemissao) {
        this.dataDemissao = dataDemissao;
    }
}
