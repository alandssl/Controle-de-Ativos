package com.pca.repository;

import com.pca.model.TipoEquipamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface tipoEquipamentoRepository extends JpaRepository<TipoEquipamento, String> {

}
