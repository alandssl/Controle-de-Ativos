package com.pca.service;


import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pca.model.NotaFiscal;
import com.pca.repository.NotaFiscalRepository;

@Service
public class NotaFiscalService {

    @Autowired
    private NotaFiscalRepository repository;

    public NotaFiscal salvar(NotaFiscal nota) {
        return repository.save(nota);
    }

    // public NotaFiscal buscarPorNomeArquivo(String nomeArquivo) {
    //     return repository.findByNomeArquivo(nomeArquivo);
    // }

    public List<NotaFiscal> buscarPorPeriodo(Date inicio, Date fim) {
        return repository.findByDataEmissaoBetween(inicio, fim);
    }

    public List<NotaFiscal> buscarPorFornecedor(String fornecedor) {
        return repository.findByFornecedorNomeContainingIgnoreCase(fornecedor);
    }

    public List<String> listarFornecedores() {
        return repository.findDistinctFornecedorNomes();
    }

    public List<String> listarNumeros() {
        return repository.findDistinctNumeros();
    }

    public NotaFiscal buscarPorNumero(String numero) {
        return repository.findByNumero(numero);
    }

    public NotaFiscal findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Nota Fiscal não encontrada"));
    }

    public List<NotaFiscal> listarTodas() {
        return repository.findAll();
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    // public String salvarAnexo(Long id, org.springframework.web.multipart.MultipartFile file)
    //         throws java.io.IOException {
    //     NotaFiscal nf = findById(id);

    //     // 1. Definir diretório
    //     java.io.File workDir = new java.io.File(".").getCanonicalFile();
    //     java.io.File uploadRoot = new java.io.File(workDir, "uploads");
    //     java.io.File nfDir = new java.io.File(uploadRoot, "notas_fiscais");
    //     if (!nfDir.exists()) {
    //         nfDir.mkdirs();
    //     }

    //     // 2. Definir nome único
    //     String uniqueFilename = System.currentTimeMillis() + "_"
    //             + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.-]", "_");
    //     java.io.File destFile = new java.io.File(nfDir, uniqueFilename);

    //     // 3. Salvar arquivo no disco
    //     try (java.io.FileOutputStream fos = new java.io.FileOutputStream(destFile)) {
    //         fos.write(file.getBytes());
    //     }

    //     // 4. Atualizar entidade
    //     nf.setNomeArquivo(file.getOriginalFilename());
    //     nf.setTipoArquivo(file.getContentType());
    //     nf.setTamanhoArquivo(file.getSize());
    //     nf.setCaminhoArquivo(destFile.getAbsolutePath());

    //     repository.save(nf);

    //     return destFile.getAbsolutePath();
    // }
}
