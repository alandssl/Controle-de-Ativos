package com.pca.service;

import com.pca.model.Movimento;
import com.pca.repository.MovimentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MovimentoService {

    private final MovimentoRepository movimentoRepository;

    public Movimento salvar(Movimento movimento) {
        return movimentoRepository.save(movimento);
    }

    public Optional<Movimento> buscarPorId(Long id) {
        return movimentoRepository.findById(id);
    }

    public List<Movimento> listarTodos() {
        return movimentoRepository.findAll();
    }

}