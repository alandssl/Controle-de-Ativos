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

    public void deletar(Long id) {
        movimentoRepository.deleteById(id);
    }
}
