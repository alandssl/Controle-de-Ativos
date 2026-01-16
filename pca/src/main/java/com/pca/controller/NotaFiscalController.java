package com.pca.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import com.pca.model.NotaFiscal;
import com.pca.service.NotaFiscalService;
import com.pca.util.NotaFiscalReportUtil;
import com.pca.dto.NotaFiscalRequest;
import com.pca.repository.notaFiscalRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/notas-fiscais")
public class NotaFiscalController {

    @Autowired
    private NotaFiscalService notaFiscalService;
    @Autowired
    private notaFiscalRepository repository;

    @GetMapping
    public java.util.List<NotaFiscal> listarTodas() {
        return notaFiscalService.listarTodas();
    }

    @GetMapping("/fornecedores")
    public ResponseEntity<java.util.List<String>> listarFornecedores() {
        return ResponseEntity.ok(notaFiscalService.listarFornecedores());
    }

    @GetMapping("/numeros")
    public ResponseEntity<java.util.List<String>> listarNumeros() {
        return ResponseEntity.ok(notaFiscalService.listarNumeros());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotaFiscal> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(notaFiscalService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<NotaFiscal> criar(@RequestBody NotaFiscalRequest request) {

        NotaFiscal nf = com.pca.model.NotaFiscal.builder()
                .numero(request.numero())
                .serie(request.serie())
                .dataEmissao(request.dataEmissao())
                .dataEntrada(request.dataEntrada())
                .valorTotal(request.valorTotal())
                .fornecedorNome(request.fornecedorNome())
                .fornecedorCnpj(request.fornecedorCnpj())
                .fornecedorEndereco(request.fornecedorEndereco())
                .chaveAcesso(request.chaveAcesso())
                .observacoes(request.observacoes())
                .createdAt(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.ok(notaFiscalService.salvar(nf));
    }
    // @org.springframework.web.bind.annotation.PostMapping("/{id}/anexo")
    // public ResponseEntity<String> uploadAnexo(@PathVariable Long id,
    // @org.springframework.web.bind.annotation.RequestParam("file")
    // org.springframework.web.multipart.MultipartFile file) {
    // try {
    // String path = notaFiscalService.salvarAnexo(id, file);
    // return ResponseEntity.ok(path);
    // } catch (Exception e) {
    // e.printStackTrace();
    // return ResponseEntity.internalServerError().body("Erro ao salvar anexo: " +
    // e.getMessage());
    // }
    // }

    // Endpoint para gerar PDF de uma nota por ID
    // @GetMapping("/arquivo/{id}")
    // public ResponseEntity<byte[]> gerarPdf(@PathVariable Long id) throws Exception {
    //     NotaFiscal nota = notaFiscalService.findById(id);
    //     if (nota == null) {
    //         return ResponseEntity.notFound().build();
    //     }

    //     byte[] pdfBytes = NotaFiscalReportUtil.gerarRelatorioPDF(nota);

    //     return ResponseEntity.ok()
    //             .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=nota_" + nota.getNumero() + ".pdf")
    //             .contentType(MediaType.APPLICATION_PDF).contentLength(nota.getTamanhoArquivo())
    //             .body(pdfBytes);
    // }

    @GetMapping("/arquivo/{id}")
    public ResponseEntity<byte[]> gerarPdf(@PathVariable Long id) throws Exception {

    NotaFiscal nota = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Nota fiscal não encontrada"));

    byte[] pdfBytes = NotaFiscalReportUtil.gerarRelatorioPDF(nota);

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=nota-fiscal-" + nota.getNumero() + ".pdf")
        .contentType(MediaType.APPLICATION_PDF)
        .body(pdfBytes);
    }

}
