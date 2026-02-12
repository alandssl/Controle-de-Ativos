package com.pca.service;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.pca.model.Movimento;
import com.pca.repository.MovimentoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovimentoService {

    private final MovimentoRepository movimentoRepository;

    public Movimento salvar(Movimento movimento) {
        return movimentoRepository.save(movimento);
    }

    public Optional<Movimento> buscarPorId(Long id) {
        return movimentoRepository.findById(id);
    }

    public List<Movimento> listarTodos() {
        return movimentoRepository.findAll();
    }

    public Movimento salvarArquivo(Long id, MultipartFile arquivo) {
        try {
            byte[] bytes = arquivo.getBytes();

            Optional<Movimento> updatedMovimento = buscarPorId(id);
            updatedMovimento.ifPresent(m -> {
                m.setNomeArquivo(arquivo.getOriginalFilename());
                m.setTipoArquivo(arquivo.getContentType());
                m.setTamanhoArquivo(arquivo.getSize());
                Base64.getEncoder().encodeToString(bytes);
            });

            return updatedMovimento
                    .map(movimentoRepository::save)
                    .orElseThrow(() -> new RuntimeException("Movimento não encontrado com id: " + id));
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar o arquivo: " + e.getMessage());
        }
    }

}