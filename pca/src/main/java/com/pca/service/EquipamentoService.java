package com.pca.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pca.model.Equipamento;
import com.pca.repository.EquipamentoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EquipamentoService {
    private final EquipamentoRepository repository;
    private final com.pca.repository.MovimentoRepository movimentoRepository;
    private final com.pca.repository.ColaboradorRepository colaboradorRepository;

    @Transactional
    public Equipamento cadastrar(Equipamento equipamento, Long responsavelId) {
        if (equipamento.getEstado() == null) {
            throw new IllegalArgumentException("Estado do equipamento é obrigatório");
        }
        Equipamento salvo = repository.save(equipamento);

        if (responsavelId != null) {
            com.pca.model.Colaborador colaborador = colaboradorRepository.findById(responsavelId)
                    .orElseThrow(() -> new IllegalArgumentException("Colaborador não encontrado"));

            com.pca.model.Movimento movimento = new com.pca.model.Movimento();
            movimento.setTipoMovimento("SAIDA");
            movimento.setObservacao("Entrega inicial ao cadastrar");
            movimento.setDataMovimento(java.time.LocalDateTime.now());
            movimento.setEquipamento(salvo);
            movimento.setTipo(salvo.getTipoEquipamento());
            movimento.setColaborador(colaborador);
            // movimento.setSetor(colaborador.getSetor()); // Optional based on model

            movimentoRepository.save(movimento);
        }

        return salvo;
    }

    public List<Equipamento> listarTodos() {
        return repository.findAll();
    }

    public Equipamento buscarPorId(Long id) {
        return repository.findById(id).orElseThrow();
    }

    @Transactional
    public void remover(Long id) {
        repository.deleteById(id);
    }

    public List<Equipamento> buscarPorEstado(String estadoTipo) {
        return repository.findByEstado_EstadoTipo(estadoTipo);
    }

    public Equipamento buscarPorPatrimonio(String patrimonio) {
        return repository.findByPatrimonio(patrimonio);
    }

    @Transactional
    public Equipamento atualizar(Long id, Equipamento atualizado) {
        Equipamento existente = buscarPorId(id);

        // Atualiza campos
        if (atualizado.getPatrimonio() != null)
            existente.setPatrimonio(atualizado.getPatrimonio());
        if (atualizado.getEstado() != null)
            existente.setEstado(atualizado.getEstado());
        if (atualizado.getTipoEquipamento() != null)
            existente.setTipoEquipamento(atualizado.getTipoEquipamento());
        if (atualizado.getNotaFiscal() != null)
            existente.setNotaFiscal(atualizado.getNotaFiscal());
        if (atualizado.getStatus() != null)
            existente.setStatus(atualizado.getStatus());
        if (atualizado.getFabricante() != null)
            existente.setFabricante(atualizado.getFabricante());
        if (atualizado.getEtiqueta() != null)
            existente.setEtiqueta(atualizado.getEtiqueta());
        if (atualizado.getTec() != null)
            existente.setTec(atualizado.getTec());
        if (atualizado.getModelo() != null)
            existente.setModelo(atualizado.getModelo());
        if (atualizado.getGpu() != null)
            existente.setGpu(atualizado.getGpu());
        if (atualizado.getTipoRam() != null)
            existente.setTipoRam(atualizado.getTipoRam());
        if (atualizado.getQuantidadeRam() != null)
            existente.setQuantidadeRam(atualizado.getQuantidadeRam());
        if (atualizado.getTipoArmazenamento() != null)
            existente.setTipoArmazenamento(atualizado.getTipoArmazenamento());
        if (atualizado.getQuantidadeArmazenamento() != null)
            existente.setQuantidadeArmazenamento(atualizado.getQuantidadeArmazenamento());
        if (atualizado.getDescricao() != null)
            existente.setDescricao(atualizado.getDescricao());
        if (atualizado.getValor() != null)
            existente.setValor(atualizado.getValor());
        if (atualizado.getData_aquisicao() != null)
            existente.setData_aquisicao(atualizado.getData_aquisicao());

        return repository.save(existente);
    }
}