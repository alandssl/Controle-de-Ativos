package com.pca.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pca.model.Movimento;

@Repository
public interface MovimentoRepository extends JpaRepository<Movimento, Long> {
}
