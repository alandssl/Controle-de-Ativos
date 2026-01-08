package com.pca.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pca.model.NotaFiscal;

@Repository
public interface  notaFiscalRepository extends JpaRepository<NotaFiscal, Integer>{
    List<NotaFiscal> findByDataEmissaoBetween(Date inicio, Date fim);
    List<NotaFiscal> findByFornecedorNomeContainingIgnoreCase(String fornecedor);
    NotaFiscal findByNumero(String numero);
}
