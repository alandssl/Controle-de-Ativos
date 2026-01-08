package com.pca.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pca.model.Colaborador;

@Repository
public interface ColaboradorRepository extends JpaRepository<Colaborador, Long> {
    // Exemplo: buscar colaborador pela chapa
    Colaborador findByChapa(String chapa);
    // Buscar colaborador pelo nome ignorando letras maiusculas e minusculas
    List<Colaborador> findByNomeContainingIgnoreCase(String nome);
    // Busca colaborador pelo codigo de pessoa dele
    List<Colaborador> findByCodPessoa(Long codigo);
}
