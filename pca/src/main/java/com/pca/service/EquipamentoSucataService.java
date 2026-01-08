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
    public EquipamentoSucata cadastrar(EquipamentoSucata equipamentoSucata){

        // Se foi informado um Equipamento, carregá-lo do banco para garantir que não é transient
        if (equipamentoSucata.getDescricao() != null && equipamentoSucata.getEquipamento().getPatrimonio() != null) {

            Equipamento equipamento = equipamentoRepository
            .findByPatrimonio(equipamentoSucata.getEquipamento().getPatrimonio());
            
            if (equipamento == null) {
                throw new RuntimeException("Equipamento com patrimônio "
                 + equipamentoSucata.getDescricao() + " não encontrado");
            }
            equipamentoSucata.setDescricao(equipamento);
        }
        return sucataRepository.save(equipamentoSucata);
    }

    public List<EquipamentoSucata> listarTodos (){
        return sucataRepository.findAll();
    }


    public EquipamentoSucata buscarPorId(Long id){
        return sucataRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));
    }

}
