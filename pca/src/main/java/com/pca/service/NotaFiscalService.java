package com.pca.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pca.model.NotaFiscal;
import com.pca.repository.notaFiscalRepository;

@Service
public class NotaFiscalService {

    @Autowired
    private notaFiscalRepository repository;

    public NotaFiscal salvar(NotaFiscal nota) {
        
        nota.calcularValorTotal();
        return repository.save(nota);
    }

    public List<NotaFiscal> buscarPorPeriodo(Date inicio, Date fim) {
        return repository.findByDataEmissaoBetween(inicio, fim);
    }

    public List<NotaFiscal> buscarPorFornecedor(String fornecedor) {
        return repository.findByFornecedorNomeContainingIgnoreCase(fornecedor);
    }

    public NotaFiscal buscarPorNumero(String numero) {
        return repository.findByNumero(numero);
    }
    public NotaFiscal findById(Long id) {
        return repository.findById(id.intValue()).orElseThrow(() -> new RuntimeException("Nota Fiscal não encontrada"));
    }
}
