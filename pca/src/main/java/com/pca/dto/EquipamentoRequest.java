package com.pca.dto;

import java.math.BigDecimal;

import java.time.LocalDate;

public record EquipamentoRequest(
                String estado,
                String tipoEquipamento,
                Long notaFiscal,
                String fabricante,
                String etiqueta,
                String tec,
                String patrimonio,
                String modelo,
                String gpu,
                String tipoRam,
                Integer quantidadeRam,
                String tipoArmazenamento,
                Integer quantidadeArmazenamento,
                String descricao,
                BigDecimal valor,
                Long status,
                LocalDate dataAquisicao,
                Long responsavelId,
                String imeiCelular,
                NotaFiscalRequest novaNotaFiscal) {

}
