package com.pca.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pca.model.Equipamento;
import com.pca.model.EquipamentoSucata;
import com.pca.repository.EquipamentoRepository;
import com.pca.repository.EquipamentoSucataRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EquipamentoSucataService {

    private final EquipamentoSucataRepository sucataRepository;
    private final EquipamentoRepository equipamentoRepository;

    @Transactional
    public EquipamentoSucata cadastrar(EquipamentoSucata equipamentoSucata) {

        // Se foi informado um Equipamento, carregá-lo do banco para garantir que não é
        // transient
        if (equipamentoSucata.getEquipamento() != null) {
            Equipamento eq = equipamentoSucata.getEquipamento();
            if (eq.getId() != null) {
                eq = equipamentoRepository.findById(eq.getId())
                        .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));
            } else if (eq.getPatrimonio() != null) {
                eq = equipamentoRepository.findByPatrimonio(eq.getPatrimonio());
                if (eq == null) {
                    throw new RuntimeException("Equipamento com patrimônio "
                            + equipamentoSucata.getEquipamento().getPatrimonio() + " não encontrado");
                }
            }
            equipamentoSucata.setEquipamento(eq);
            // Also update the legacy alias if needed, though Lombok handles the real field
            equipamentoSucata.setDescricao(eq);

            // Soft delete Equipment to remove from main lists
            eq.setExcludedAt(java.time.LocalDateTime.now());
            equipamentoRepository.save(eq);
        }
        return sucataRepository.save(equipamentoSucata);
    }

    public List<EquipamentoSucata> listarTodos() {
        return sucataRepository.findAll();
    }

    public EquipamentoSucata buscarPorId(Long id) {
        return sucataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));
    }

}
