package com.pca.controller;

import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // Importa todas as anotações

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.pca.model.Movimento;
import com.pca.service.MovimentoService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*") // Permite acesso do React
@RestController
@RequestMapping("/api/movimentos")
@RequiredArgsConstructor
public class MovimentoController {

    private final MovimentoService service;

    @GetMapping
    public List<Movimento> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movimento> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Movimento> cadastrar(@RequestBody Movimento movimento) {
        Movimento salvo = service.salvar(movimento);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(salvo.getId())
                .toUri();
        return ResponseEntity.created(location).body(salvo);
    }

    // Método PUT para atualização de dados (texto)
    @PutMapping("/{id}")
    public ResponseEntity<Movimento> atualizar(@PathVariable Long id, @RequestBody Movimento dados) {
        return service.buscarPorId(id)
                .map(existente -> {
                    existente.setTipoMovimento(dados.getTipoMovimento());
                    existente.setDataMovimento(dados.getDataMovimento());
                    existente.setValor(dados.getValor());
                    existente.setObservacao(dados.getObservacao());
                    existente.setIdColaborador(dados.getIdColaborador());
                    existente.setIdEquipamento(dados.getIdEquipamento());
                    return ResponseEntity.ok(service.salvar(existente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

}