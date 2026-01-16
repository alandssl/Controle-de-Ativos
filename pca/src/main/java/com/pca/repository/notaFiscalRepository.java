package com.pca.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pca.model.NotaFiscal;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscal, Long> {
    List<NotaFiscal> findByDataEmissaoBetween(Date inicio, Date fim);

    List<NotaFiscal> findByFornecedorNomeContainingIgnoreCase(String fornecedor);

    NotaFiscal findByNumero(String numero);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT n.fornecedorNome FROM NotaFiscal n WHERE n.fornecedorNome IS NOT NULL ORDER BY n.fornecedorNome")
    List<String> findDistinctFornecedorNomes();

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT n.numero FROM NotaFiscal n WHERE n.numero IS NOT NULL ORDER BY n.numero")
    List<String> findDistinctNumeros();

    // NotaFiscal findByNomeArquivo(String nomeArquivo);
}
