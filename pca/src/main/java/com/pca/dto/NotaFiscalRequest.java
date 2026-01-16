package com.pca.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record NotaFiscalRequest(
        String numero,
        String serie,
        LocalDate dataEmissao,
        LocalDate dataEntrada,
        BigDecimal valorTotal,
        String fornecedorNome,
        String fornecedorCnpj,
        String fornecedorEndereco,
        String chaveAcesso,
        String observacoes) {
}
