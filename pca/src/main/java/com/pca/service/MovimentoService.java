package com.pca.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.pca.model.Movimento;
import com.pca.repository.MovimentoRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovimentoService {

    private final MovimentoRepository movimentoRepository;

    @Transactional
    public Movimento salvar(Movimento movimento) {
        return movimentoRepository.save(movimento);
    }

    public List<Movimento> listarTodos() {
        return movimentoRepository.findAll();
    }

    public Optional<Movimento> buscarPorId(Long id) {
        return movimentoRepository.findById(id);
    }

    @Transactional
    public Optional<Movimento> atualizar(Long id, Movimento atualizado) {
        return movimentoRepository.findById(id).map(existente -> {
            if (atualizado.getTipoMovimento() != null)
                existente.setTipoMovimento(atualizado.getTipoMovimento());
            if (atualizado.getDataMovimento() != null)
                existente.setDataMovimento(atualizado.getDataMovimento());
            if (atualizado.getObservacao() != null)
                existente.setObservacao(atualizado.getObservacao());
            if (atualizado.getValor() != null)
                existente.setValor(atualizado.getValor());
            if (atualizado.getIdEquipamento() != null)
                existente.setIdEquipamento(atualizado.getIdEquipamento());
            if (atualizado.getIdColaborador() != null)
                existente.setIdColaborador(atualizado.getIdColaborador());
            if (atualizado.getSetor() != null)
                existente.setSetor(atualizado.getSetor());

            return movimentoRepository.save(existente);
        });
    }

    public void deletar(Long id) {
        movimentoRepository.deleteById(id);
    }
}
