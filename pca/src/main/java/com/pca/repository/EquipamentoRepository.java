package com.pca.repository;

import com.pca.model.Equipamento;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface  EquipamentoRepository extends JpaRepository<Equipamento, Long>{
    
    @Query("SELECT e FROM Equipamento e WHERE e.estado.estadoTipo = :estado")
    List<Equipamento> buscarPorEstado(@Param("estado") String estado);

    
    List<Equipamento> findByEstado_EstadoTipo(String estadoTipo);

    Equipamento findByPatrimonio(String patrimonio);
}
