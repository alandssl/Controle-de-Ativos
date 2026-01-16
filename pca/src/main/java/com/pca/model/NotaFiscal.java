package com.pca.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notas_fiscais")
public class NotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "numero", length = 20, nullable = false, unique = true)
    private String numero; // Número da NF

    @Column(name = "serie", length = 10)
    private String serie;

    @Column(name = "data_emissao")
    private LocalDate dataEmissao;

    @Column(name = "data_entrada")
    private LocalDate dataEntrada;

    @Column(name = "valor_total", precision = 15, scale = 2)
    private BigDecimal valorTotal;

    // --- Dados do fornecedor ---
    @Column(name = "fornecedor_nome", length = 150, nullable = false)
    private String fornecedorNome;

    @Column(name = "fornecedor_cnpj", length = 18)
    private String fornecedorCnpj;

    @Column(name = "fornecedor_endereco", length = 255)
    private String fornecedorEndereco;

    // --- Dados da NFe ---
    @Column(name = "chave_acesso", length = 44, unique = true)
    private String chaveAcesso;

    @Column(name = "observacoes", length = 500)
    private String observacoes;

    // @Column(name = "nome_arquivo")
    // private String nomeArquivo;

    // @Column(name = "caminho_arquivo")
    // private String caminhoArquivo;

    // @Column(name = "tipo_arquivo")
    // private String tipoArquivo;

    // @Column(name = "tamanho_arquivo")
    // private Long tamanhoArquivo;

    @Column(name = "data_entrega")
    private LocalDateTime dataEntrega;

    // Relacionamento com Equipamentos
    @com.fasterxml.jackson.annotation.JsonManagedReference
    @OneToMany(mappedBy = "notaFiscal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Equipamento> equipamentos;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "update_at")
    private LocalDateTime updateAt;

    // --- Métodos úteis ---

    public String getNumero() {
        return this.numero;
    }

    /**
     * Recalcula o valor total somando os valores de todos os equipamentos
     * vinculados.
     */
    public void calcularValorTotal() {
        if (equipamentos != null && !equipamentos.isEmpty()) {
            this.valorTotal = equipamentos.stream()
                    .map(Equipamento::getValor) // e -> e.getValor();
                    .filter(v -> v != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else {
            this.valorTotal = BigDecimal.ZERO;
        }
    }

    /**
     * Adiciona um equipamento à nota fiscal e atualiza o valor total.
     */
    public void adicionarEquipamento(Equipamento equipamento) {
        equipamentos.add(equipamento);
        equipamento.setNotaFiscal(this);
        calcularValorTotal();
    }

    /**
     * Remove um equipamento da nota fiscal e atualiza o valor total.
     */
    public void removerEquipamento(Equipamento equipamento) {
        equipamentos.remove(equipamento);
        equipamento.setNotaFiscal(null);
        calcularValorTotal();
    }
}
