package com.pca.util;

import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.FontFactory;
import com.pca.model.NotaFiscal;
import com.pca.model.Equipamento;

import java.io.ByteArrayOutputStream;

public class NotaFiscalReportUtil {

    public static byte[] gerarRelatorioPDF(NotaFiscal nota) throws Exception {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);

        document.open();

        document.add(new Paragraph("NOTA FISCAL", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
        document.add(new Paragraph("Número: " + nota.getNumero()));
        document.add(new Paragraph("Série: " + nota.getSerie()));
        document.add(new Paragraph("Fornecedor: " + nota.getFornecedorNome() + " - CNPJ: " + nota.getFornecedorCnpj()));
        document.add(new Paragraph("Endereço: " + nota.getFornecedorEndereco()));
        document.add(new Paragraph("Data de Emissão: " + nota.getDataEmissao()));
        document.add(new Paragraph("Data de Entrada: " + nota.getDataEntrada()));
        document.add(new Paragraph("Chave de Acesso: " + nota.getChaveAcesso()));
        document.add(new Paragraph("Observações: " + (nota.getObservacoes() != null ? nota.getObservacoes() : "")));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(3);
        table.addCell("Equipamento");
        table.addCell("Descrição");
        table.addCell("Valor");

        if (nota.getEquipamentos() != null) {
            for (Equipamento eq : nota.getEquipamentos()) {
                table.addCell(String.valueOf(eq.getId()));
                table.addCell(eq.getDescricao() != null ? eq.getDescricao() : "");
                table.addCell(eq.getValor() != null ? eq.getValor().toString() : "0.00");
            }
        }

        document.add(table);
        document.add(new Paragraph(" "));
        document.add(new Paragraph("Valor Total: R$ " + nota.getValorTotal()));

        document.close();
        return out.toByteArray();
    }
}
