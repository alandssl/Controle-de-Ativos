package com.pca.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pca.model.Movimento;
import com.pca.service.MovimentoService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/movimentos")
@RequiredArgsConstructor
public class MovimentoController {

    private final MovimentoService movimentoService;


     // Listar todos
    @GetMapping
    public List<Movimento> listarTodos() {
        return movimentoService.listarTodos();
    }

    // Criar movimentação
    @PostMapping
    public ResponseEntity<Movimento> criar(@RequestBody Movimento movimento) {
        Movimento novoMovimento = movimentoService.salvar(movimento);
        return ResponseEntity.ok(novoMovimento);
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Movimento> buscarPorId(@PathVariable Long id) {
        return movimentoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Deletar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        movimentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
