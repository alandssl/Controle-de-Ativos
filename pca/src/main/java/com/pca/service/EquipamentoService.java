package com.pca.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pca.model.Equipamento;
import com.pca.repository.EquipamentoRepository;
import com.pca.dto.NotaFiscalRequest;

import com.pca.model.Colaborador;
import com.pca.model.Movimento;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EquipamentoService {
    private final EquipamentoRepository repository;
    private final com.pca.repository.notaFiscalRepository notaFiscalRepository;
    private final com.pca.repository.MovimentoRepository movimentoRepository;
    private final com.pca.repository.ColaboradorRepository colaboradorRepository;

    @Transactional
    public Equipamento cadastrar(Equipamento equipamento, Long responsavelId,
            NotaFiscalRequest novaNotaFiscal) {
        if (equipamento.getEstado() == null) {
            throw new IllegalArgumentException("Estado do equipamento é obrigatório");
        }

        if (novaNotaFiscal != null) {
            com.pca.model.NotaFiscal nf = com.pca.model.NotaFiscal.builder()
                    .numero(novaNotaFiscal.numero())
                    .serie(novaNotaFiscal.serie())
                    .dataEmissao(novaNotaFiscal.dataEmissao())
                    .dataEntrada(novaNotaFiscal.dataEntrada())
                    .valorTotal(novaNotaFiscal.valorTotal())
                    .fornecedorNome(novaNotaFiscal.fornecedorNome())
                    .fornecedorCnpj(
                            novaNotaFiscal.fornecedorCnpj() != null && !novaNotaFiscal.fornecedorCnpj().isBlank()
                                    ? novaNotaFiscal.fornecedorCnpj()
                                    : null)
                    .fornecedorEndereco(novaNotaFiscal.fornecedorEndereco())
                    .chaveAcesso(novaNotaFiscal.chaveAcesso() != null && !novaNotaFiscal.chaveAcesso().isBlank()
                            ? novaNotaFiscal.chaveAcesso()
                            : null)
                    .observacoes(novaNotaFiscal.observacoes())
                    .createdAt(java.time.LocalDateTime.now())
                    .build();

            nf = notaFiscalRepository.save(nf);
            equipamento.setNotaFiscal(nf);
        }

        Equipamento salvo = repository.save(equipamento);

        if (responsavelId != null) {
            Colaborador colaborador = colaboradorRepository.findById(responsavelId)
                    .orElseThrow(() -> new IllegalArgumentException("Colaborador não encontrado"));

            Movimento movimento = new com.pca.model.Movimento();
            movimento.setTipoMovimento("SAIDA");
            movimento.setObservacao("Entrega inicial ao cadastrar");
            movimento.setDataMovimento(java.time.LocalDateTime.now());
            movimento.setIdEquipamento(salvo);
            movimento.setTipo(salvo.getTipoEquipamento());
            movimento.setIdColaborador(colaborador);
            // movimento.setSetor(colaborador.getSetor()); // Optional based on model

            movimentoRepository.save(movimento);
        }

        return salvo;
    }

    public List<Equipamento> listarTodos() {
        return repository.findAll();
    }

    public Equipamento buscarPorId(Long id) {
        return repository.findById(id).orElseThrow();
    }

    @Transactional
    public void remover(Long id) {
        repository.deleteById(id);
    }

    public List<Equipamento> buscarPorEstado(String estadoTipo) {
        return repository.findByEstado_EstadoTipo(estadoTipo);
    }

    public Equipamento buscarPorPatrimonio(String patrimonio) {
        return repository.findByPatrimonio(patrimonio);
    }

    @Transactional
    public Equipamento atualizar(Long id, Equipamento atualizado) {
        Equipamento existente = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Equipamento não encontrado"));

        existente.setEstado(atualizado.getEstado());
        existente.setTipoEquipamento(atualizado.getTipoEquipamento());
        existente.setNotaFiscal(atualizado.getNotaFiscal());
        existente.setStatus(atualizado.getStatus());
        existente.setFabricante(atualizado.getFabricante());
        existente.setEtiqueta(atualizado.getEtiqueta());
        existente.setTec(atualizado.getTec());
        existente.setPatrimonio(atualizado.getPatrimonio());
        existente.setModelo(atualizado.getModelo());
        existente.setGpu(atualizado.getGpu());
        existente.setTipoRam(atualizado.getTipoRam());
        existente.setQuantidadeRam(atualizado.getQuantidadeRam());
        existente.setTipoArmazenamento(atualizado.getTipoArmazenamento());
        existente.setQuantidadeArmazenamento(atualizado.getQuantidadeArmazenamento());
        existente.setDescricao(atualizado.getDescricao());
        existente.setValor(atualizado.getValor());
        existente.setData_aquisicao(atualizado.getData_aquisicao());
        existente.setImeiCelular(atualizado.getImeiCelular());

        return repository.save(existente);
    }

}