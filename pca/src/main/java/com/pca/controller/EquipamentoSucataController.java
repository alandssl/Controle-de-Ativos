package com.pca.controller; // Define o pacote onde a classe está localizada

import java.util.List; // Importa a interface List para manipulação de listas

import org.springframework.http.ResponseEntity; // Importa ResponseEntity para controlar a resposta HTTP
import org.springframework.web.bind.annotation.CrossOrigin; // Importa anotação para permitir requisições de diferentes origens (CORS)
import org.springframework.web.bind.annotation.GetMapping; // Importa anotação para mapear requisições HTTP GET
import org.springframework.web.bind.annotation.PathVariable; // Importa anotação para vincular templates de URI a argumentos do método
import org.springframework.web.bind.annotation.PostMapping; // Importa anotação para mapear requisições HTTP POST
import org.springframework.web.bind.annotation.RequestBody; // Importa anotação para vincular o corpo da requisição HTTP a um objeto
import org.springframework.web.bind.annotation.RequestMapping; // Importa anotação para definir a rota base do controlador
import org.springframework.web.bind.annotation.RestController; // Importa anotação para declarar que a classe é um controlador REST

import com.pca.model.EquipamentoSucata; // Importa a classe de modelo EquipamentoSucata
import com.pca.service.EquipamentoSucataService; // Importa o serviço relacionado a EquipamentoSucata

import lombok.RequiredArgsConstructor; // Importa anotação do Lombok para gerar construtor com argumentos obrigatórios

@CrossOrigin(origins = "*") // Permite requisições de qualquer origem (configuração CORS)
@RestController // Define a classe como um controlador REST
@RequestMapping("/api/sucata") // Define a URL base para este controlador
@RequiredArgsConstructor // Gera automaticamente o construtor com os campos 'final'
public class EquipamentoSucataController { // Declara a classe do controlador

    private final EquipamentoSucataService sucataService; // Inclusão do serviço de sucata como dependência final

    @GetMapping // Mapeia requisições GET para recuperar todos os itens de sucata
    public ResponseEntity<List<EquipamentoSucata>> listarTodos() { // Método que retorna uma lista encapsulada em
                                                                   // ResponseEntity
        return ResponseEntity.ok(sucataService.listarTodos()); // Retorna sucesso (200) com a lista de sucatas obtida do
                                                               // serviço
    }

    @PostMapping // Mapeia requisições POST para criar um novo registro de sucata
    public EquipamentoSucata criar(@RequestBody EquipamentoSucata equipamentoSucata) { // Recebe dados da sucata no
                                                                                       // corpo da requisição
        return sucataService.cadastrar(equipamentoSucata); // Chama o serviço para salvar e retorna o objeto salvo
    }

    @GetMapping("/{id}") // Mapeia requisições GET com um ID específico
    public ResponseEntity<EquipamentoSucata> buscarPorId(@PathVariable Long id) { // Busca uma sucata pelo ID fornecido
                                                                                  // na URL
        EquipamentoSucata sucata = sucataService.buscarPorId(id); // Obtém o objeto do serviço usando o ID
        return ResponseEntity.ok(sucata); // Retorna sucesso (200) com o objeto encontrado
    }

}
