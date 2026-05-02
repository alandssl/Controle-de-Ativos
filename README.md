# 🖥️ Sistema de Gestão de Ativos de TI

API backend desenvolvida com Java e Spring Boot para controle e gerenciamento de ativos de tecnologia da informação, como computadores, notebooks e periféricos.

---

## 📖 Sobre o Projeto

O sistema tem como objetivo centralizar o controle de equipamentos de TI, permitindo o registro, consulta e acompanhamento de informações relevantes dos ativos.

Entre os ativos controlados estão:
- Computadores  
- Notebooks  
- Monitores  
- Impressoras  
- Periféricos  
- Outros equipamentos de TI  

Cada ativo possui informações como categoria, data de aquisição e status.

> ⚠️ Este projeto não foi iniciado por mim, porém fui responsável por dar continuidade ao desenvolvimento durante meu estágio, realizando melhorias, correções e implementações adicionais.

---

## 🎯 Objetivo

O sistema foi desenvolvido para facilitar:

- Cadastro de ativos  
- Consulta de equipamentos  
- Organização por categorias  
- Controle de datas de aquisição  
- Visibilidade dos recursos de TI  

Com isso, o setor de TI consegue manter um controle mais eficiente e organizado dos equipamentos.

---

## 🚀 Funcionalidades

- Cadastro de novos ativos  
- Consulta de ativos cadastrados  
- Organização por categorias  
- Controle de informações dos equipamentos  

---

## 🛠️ Tecnologias

### Backend
- Java  
- Spring Boot  
- Spring Data JPA  
- Hibernate  

### Banco de Dados
- SQL Server  

### Ferramentas
- Postman (testes de API)  
- Git / GitHub  
- IntelliJ / VSCode  
- SQL Server Management Studio  

---

## 🧠 Arquitetura

O projeto segue o padrão de API REST com arquitetura em camadas:

- **Controller** → Responsável pelos endpoints da API  
- **Service** → Regras de negócio e validações  
- **Repository** → Acesso ao banco de dados  
- **Entity** → Representação das tabelas  
- **DTO** → Transferência de dados  

---

## 📡 Endpoints

### Criar Ativo
`POST /equipamentos`

**Exemplo de JSON:**
```json
{
  "categoria": "Notebook",
  "dataAquisicao": "2025-06-10",
  "descricao": "Notebook Dell Latitude",
  "ativo": true
}
