package com.pca.service;

import java.util.List;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import com.pca.model.Colaborador;
import com.pca.repository.ColaboradorRepository;

@Service
@Transactional
public class ColaboradorService {

    private final ColaboradorRepository colaboradorRepository;

    public ColaboradorService(ColaboradorRepository colaboradorRepository) {
        this.colaboradorRepository = colaboradorRepository;
    }

    public List<Colaborador> listarTodos() {
        return colaboradorRepository.findAll();
    }

    public List<Colaborador> buscarPorNome(String nome) {
        return colaboradorRepository.findByNomeContainingIgnoreCase(nome);
    }

    public Optional<Colaborador> buscarPorId(Long id) {
        return colaboradorRepository.findById(id);
    }

    public List<Colaborador> buscarPorCodPessoa(Long codigo) {
        return colaboradorRepository.findByCodPessoa(codigo);
    }

    public Colaborador salvar(Colaborador colaborador) {
        return colaboradorRepository.save(colaborador);
    }

    public void deletar(Long id) {
        colaboradorRepository.deleteById(id);
    }
}
