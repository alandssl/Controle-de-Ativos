package com.pca.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pca.model.NotaFiscal;
import com.pca.service.NotaFiscalService;
import com.pca.util.NotaFiscalReportUtil;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/notas")
public class NotaFiscalController {

    @Autowired
    private NotaFiscalService notaFiscalService;

    // Endpoint para gerar PDF de uma nota por ID
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> gerarPdf(@PathVariable Long id) throws Exception {
        NotaFiscal nota = notaFiscalService.findById(id);
        if (nota == null) {
            return ResponseEntity.notFound().build();
        }

        byte[] pdfBytes = NotaFiscalReportUtil.gerarRelatorioPDF(nota);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=nota_" + nota.getNumero() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
