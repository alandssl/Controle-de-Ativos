package com.pca.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pca.model.Peca;

@Repository
public interface PecaRepository extends JpaRepository<Peca, Long> {

}
