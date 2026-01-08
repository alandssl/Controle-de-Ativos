package com.pca.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.pca.model.Peca;
import com.pca.repository.PecaRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class PecaService {

    private final PecaRepository repository;

    public List<Peca> listarTodos(){
        return repository.findAll();
    }

    public Peca salvar(Peca peca){
        return repository.save(peca);
    }

    public Optional<Peca> buscarPorId(Long id){
        return repository.findById(id);
    } 
    
    public void deletar(Long id){
        repository.deleteById(id);
    }
    
}
