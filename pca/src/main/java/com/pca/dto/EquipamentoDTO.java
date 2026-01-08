package com.pca.dto;

import java.math.BigDecimal;

import com.pca.model.Equipamento;


public record EquipamentoDTO(
          Long id,
        String estado,
        String tipoEquipamento,
        String notaFiscalId,
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
        String cpuMaquina,
        BigDecimal valor
) {
    public static EquipamentoDTO fromEntity(Equipamento equipamento) {
        return new EquipamentoDTO(
                equipamento.getId(),
            equipamento.getEstado().getEstadoTipo(),
            equipamento.getTipoEquipamento().getTipo(),
            equipamento.getNotaFiscal() != null ? equipamento.getNotaFiscal().getNumero() : null,
            equipamento.getFabricante(),
            equipamento.getEtiqueta(),
            equipamento.getTec(),
            equipamento.getPatrimonio(),
            equipamento.getModelo(),
            equipamento.getGpu(),
            equipamento.getTipoRam(),
            equipamento.getQuantidadeRam(),
            equipamento.getTipoArmazenamento(),
            equipamento.getQuantidadeArmazenamento(),
            equipamento.getDescricao(),
            equipamento.getValor()
        );
    }
}