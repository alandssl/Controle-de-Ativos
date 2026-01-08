package com.pca.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pca.demo.model.Colaborador;
import com.pca.demo.service.ColaboradorService;

@RestController
@RequestMapping("/api/colaboradores")
@CrossOrigin(origins = "http://localhost:3000") // permite o React consumir a API
public class ColaboradorController {

    private final ColaboradorService service;

    public ColaboradorController(ColaboradorService service) {
        this.service = service;
    }

    @GetMapping
    public List<Colaborador> getAll() {
        return service.findAll();
    }

    @PostMapping
    public Colaborador create(@RequestBody Colaborador c) {
        return service.save(c);
    }

    @PutMapping("/{id}")
    public Colaborador update(@PathVariable Long id, @RequestBody Colaborador c) {
        c.setId(id);
        return service.save(c);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
