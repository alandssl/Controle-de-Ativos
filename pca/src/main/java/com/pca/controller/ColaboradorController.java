package com.pca.controller; // Define o pacote onde a classe está localizada

import java.util.List; // Importa a interface List para manipulação de listas

import org.springframework.http.ResponseEntity; // Importa ResponseEntity para controlar a resposta HTTP completa
import org.springframework.web.bind.annotation.CrossOrigin; // Importa anotação para permitir requisições de diferentes origens
import org.springframework.web.bind.annotation.GetMapping; // Importa anotação para mapear requisições GET
import org.springframework.web.bind.annotation.PathVariable; // Importa anotação para mapear variáveis na URL
import org.springframework.web.bind.annotation.PostMapping; // Importa anotação para mapear requisições POST
import org.springframework.web.bind.annotation.PutMapping; // Importa anotação para mapear requisições PUT
import org.springframework.web.bind.annotation.RequestBody; // Importa anotação para vincular o corpo da requisição a um objeto
import org.springframework.web.bind.annotation.RequestMapping; // Importa anotação para definir a rota base do controlador
import org.springframework.web.bind.annotation.RequestParam; // Importa anotação para capturar parâmetros de consulta na URL
import org.springframework.web.bind.annotation.RestController; // Importa anotação para marcar a classe como um controlador REST

import com.pca.model.Colaborador; // Importa a classe de modelo Colaborador
import com.pca.service.ColaboradorService; // Importa o serviço de lógica de negócios do colaborador

@CrossOrigin(origins = "*") // Permite requisições CORS de qualquer origem
@RestController // Indica que esta classe é um controlador REST do Spring
@RequestMapping("/api/colaboradores") // Define o caminho base para as rotas deste controlador
public class ColaboradorController { // Início da definição da classe ColaboradorController

    private final ColaboradorService colaboradorService; // Declaração do serviço de colaborador como final

    // Construtor para injeção de dependência do serviço
    public ColaboradorController(ColaboradorService colaboradorService) {
        this.colaboradorService = colaboradorService; // Inicializa o serviço
    }

    // Método para listar todos os colaboradores
    @GetMapping // Mapeia requisições HTTP GET para a raiz do caminho (/api/colaboradores)
    public List<Colaborador> listarTodos() { // Retorna uma lista de colaboradores
        return colaboradorService.listarTodos(); // Chama o serviço para buscar todos os colaboradores
    }

    // Método para buscar colaboradores por nome
    @GetMapping("/buscar") // Mapeia requisições HTTP GET para /api/colaboradores/buscar
    public ResponseEntity<List<Colaborador>> buscarPorNome(@RequestParam String nome) { // Recebe um parâmetro 'nome' da
                                                                                        // URL
        List<Colaborador> colaboradores = colaboradorService.buscarPorNome(nome); // Busca colaboradores pelo nome
                                                                                  // usando o serviço
        if (colaboradores.isEmpty()) { // Verifica se a lista retornada está vazia
            return ResponseEntity.notFound().build(); // Retorna status 404 Not Found se nenhum colaborador for
                                                      // encontrado
        }

        return ResponseEntity.ok(colaboradores); // Retorna status 200 OK com a lista de colaboradores encontrados

    }

    // Método para buscar um colaborador por ID
    @GetMapping("/{id}") // Mapeia requisições HTTP GET para /api/colaboradores/{id}
    public ResponseEntity<Colaborador> buscarPorId(@PathVariable Long id) { // Recebe o ID da URL
        return colaboradorService.buscarPorId(id) // Busca o colaborador pelo ID
                .map(ResponseEntity::ok) // Se encontrado, retorna status 200 OK com o colaborador
                .orElse(ResponseEntity.notFound().build()); // Se não encontrado, retorna status 404 Not Found
    }

    // Método para criar um novo colaborador
    @PostMapping // Mapeia requisições HTTP POST para /api/colaboradores
    public Colaborador criar(@RequestBody Colaborador colaborador) { // Recebe um objeto Colaborador no corpo da
                                                                     // requisição
        return colaboradorService.salvar(colaborador); // Salva o novo colaborador usando o serviço e retorna o objeto
                                                       // salvo
    }

    // Método para atualizar um colaborador existente
    @PutMapping("/{id}") // Mapeia requisições HTTP PUT para /api/colaboradores/{id}
    public ResponseEntity<Colaborador> atualizar(@PathVariable Long id, // Recebe o ID da URL
            @RequestBody Colaborador colaboradorAtualizado) { // Recebe os dados atualizados no corpo da requisição
        System.out.println("Recebendo atualizacao para ID: " + id); // Loga o ID recebido para atualização
        System.out.println("Dados recebidos - Email: " + colaboradorAtualizado.getEmail() + ", CPF: " // Loga email e
                                                                                                      // CPF recebidos
                + colaboradorAtualizado.getCpf());

        return colaboradorService.buscarPorId(id).map(colab -> { // Busca o colaborador existente pelo ID
            // Atualiza os campos do colaborador existente com os novos dados
            colab.setNome(colaboradorAtualizado.getNome()); // Atualiza o nome
            colab.setFuncao(colaboradorAtualizado.getFuncao()); // Atualiza a função
            colab.setChapa(colaboradorAtualizado.getChapa()); // Atualiza a chapa
            colab.setSetor(colaboradorAtualizado.getSetor()); // Atualiza o setor
            colab.setCpf(colaboradorAtualizado.getCpf()); // Atualiza o CPF
            colab.setCnpj(colaboradorAtualizado.getCnpj()); // Atualiza o CNPJ
            colab.setEmail(colaboradorAtualizado.getEmail()); // Atualiza o email
            colab.setSituacao(colaboradorAtualizado.getSituacao()); // Atualiza a situação

            Colaborador salvo = colaboradorService.salvar(colab); // Salva as alterações no banco de dados
            System.out.println("Dados salvos - Email: " + salvo.getEmail()); // Loga o email do colaborador salvo
            return ResponseEntity.ok(salvo); // Retorna status 200 OK com o colaborador atualizado
        }).orElse(ResponseEntity.notFound().build()); // Retorna 404 Not Found se o colaborador original não existir
    }

}
