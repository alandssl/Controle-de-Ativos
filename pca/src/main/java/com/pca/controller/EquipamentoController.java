package com.pca.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.pca.dto.EquipamentoRequest;
import com.pca.model.Equipamento;
import com.pca.repository.StatusRepository;
import com.pca.repository.notaFiscalRepository;
import com.pca.repository.tipoEquipamentoRepository;
import com.pca.repository.tipoEstadoRepository;
import com.pca.service.EquipamentoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/equipamentos")
@RequiredArgsConstructor
public class EquipamentoController {
        private final EquipamentoService service;
        private final tipoEstadoRepository tipoEstadoRepository;
        private final tipoEquipamentoRepository tipoEquipamentoRepository;
        private final notaFiscalRepository notaFiscalRepository;
        private final StatusRepository statusRepository;

        @GetMapping
        public List<Equipamento> listarTodos() {
                return service.listarTodos();
        }

        @PostMapping
        public ResponseEntity<Equipamento> cadastrar(@Valid @RequestBody EquipamentoRequest request) {
                Equipamento equipamento = convertToEntity(request);
                Equipamento salvo = service.cadastrar(equipamento, request.responsavelId());
                URI location = ServletUriComponentsBuilder
                                .fromCurrentRequest()
                                .path("/{id}")
                                .buildAndExpand(salvo.getId())
                                .toUri();
                return ResponseEntity.created(location).body(salvo);
        }

        @PutMapping("/{id}")
        public ResponseEntity<Equipamento> atualizar(@PathVariable Long id,
                        @Valid @RequestBody EquipamentoRequest request) {
                Equipamento equipamento = convertToEntity(request);
                Equipamento salvo = service.atualizar(id, equipamento);
                return ResponseEntity.ok(salvo);
        }

        private Equipamento convertToEntity(EquipamentoRequest request) {

                String estado = request.estado().trim().toUpperCase();
                String tipoEquip = request.tipoEquipamento().trim().toUpperCase();

                return Equipamento.builder()
                        .estado(tipoEstadoRepository.findById(estado)
                        .orElseThrow(() -> new IllegalArgumentException("Estado inválido: " + estado)))
                        .tipoEquipamento( tipoEquipamentoRepository.findById(tipoEquip)
                        .orElseThrow(() -> new IllegalArgumentException("Tipo equipamento inválido: " + tipoEquip)))
                        .notaFiscal(request.notaFiscal() != null? notaFiscalRepository
                        .findById(request.notaFiscal())
                        .orElse(null): null)
                        .status(request.status() != null ? statusRepository.findById(request.status())
                        .orElse(null): null)
                        .fabricante(request.fabricante())
                        .etiqueta(request.etiqueta())
                        .tec(request.tec())
                        .patrimonio(request.patrimonio())
                        .modelo(request.modelo())
                        .gpu(request.gpu())
                        .tipoRam(request.tipoRam())
                        .quantidadeRam(request.quantidadeRam())
                        .tipoArmazenamento(request.tipoArmazenamento())
                        .quantidadeArmazenamento(request.quantidadeArmazenamento())
                        .descricao(request.descricao())
                        .valor(request.valor())
                        .data_aquisicao(request.dataAquisicao() != null ? request.dataAquisicao().atStartOfDay():null)
                        .build();
        }

}