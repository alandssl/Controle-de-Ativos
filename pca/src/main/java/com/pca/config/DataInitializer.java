package com.pca.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.pca.model.Status;
import com.pca.model.TipoEstado;
import com.pca.repository.StatusRepository;
import com.pca.repository.tipoEstadoRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(StatusRepository statusRepo, tipoEstadoRepository estadoRepo) {
        return args -> {
            // Inicializar Estados de Conservação (Apenas os solicitados)
            String[] estados = { "CONSERVADO", "NOVO", "QUEBRADO", "USADO" };
            for (String e : estados) {
                if (!estadoRepo.existsById(e)) {
                    TipoEstado te = new TipoEstado();
                    te.setEstadoTipo(e);
                    estadoRepo.save(te);
                    System.out.println("Estado de conservação adicionado: " + e);
                }
            }

            // Inicializar Status Operacionais (Apenas os solicitados)
            String[] statusList = { "ATIVO", "INATIVO", "MANUTENÇÃO" };
            for (String s : statusList) {
                boolean exists = statusRepo.findAll().stream()
                        .anyMatch(st -> st.getDescricao().equalsIgnoreCase(s));
                if (!exists) {
                    Status status = new Status();
                    status.setDescricao(s);
                    statusRepo.save(status);
                    System.out.println("Status operacional adicionado: " + s);
                }
            }
        };
    }
}
