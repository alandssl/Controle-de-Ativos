package com.pca.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "tipoEstado")

public class TipoEstado {
    @Id
    @Column(name= "estado_tipo")
    private String estadoTipo; //NOVO, USADO, CONSERVADO, QUEBRADO
}
