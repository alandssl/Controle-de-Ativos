package com.pca.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.pca.demo.model.Colaborador;
import com.pca.demo.repository.ColaboradorRepository;

@Service
public class ColaboradorService {
    private final ColaboradorRepository repository;

    public ColaboradorService(ColaboradorRepository repository) {
        this.repository = repository;
    }

    public List<Colaborador> findAll() {
        return repository.findAll();
    }

    public Optional<Colaborador> findById(Long id) {
        return repository.findById(id);
    }

    public Colaborador save(Colaborador c) {
        return repository.save(c);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
