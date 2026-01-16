export type StatusAtivo = 'Novo' | 'Em Uso' | 'Manutencao' | 'Quebrado' | 'Sucata' | 'Disponível' | 'Aguardando' | 'Em Manutenção';
export type TipoMovimentacao = 'Entrada' | 'Saida' | 'Manutencao' | 'Descarte';

export interface Ativo {
  id: number;
  patrimonio: string;
  modelo: string;
  data_aquisicao: string;
  id_categoria: number;
  status?: {
    id: number;
    descricao: string;
  };
  status_desc?: string;
  categoria_desc?: string;
  tipoEquipamento?: {
    tipo: string;
  };
  // Novos Campos
  estado?: string | {
    id: string; // O backend usa um ID String para estado (tipoEstado)
    descricao: string;
  };
  prefixo?: string;
  obs?: string;
  fabricante?: string;
  service_tag?: string; // etiqueta de serviço
  nome_tecnico?: string; // nome equipamento "tec"
  // Campos correspondentes do Backend
  tipoRam?: string;
  quantidadeRam?: number;
  tipoArmazenamento?: string;
  quantidadeArmazenamento?: number;

  // Chaves Legado/Frontend (opcional manter por enquanto ou remover se não utilizado)
  gpu?: string;
  ram_type?: string;
  ram_size?: string;
  storage_type?: string;
  storage_size?: string;
  descricao?: string;
  is_active?: boolean; // status "ativo ou não"
  valor?: number;
  id_nf?: number; // Relacionamento com NF
  especificacoes?: Record<string, any>;
}

export interface Colaborador {
  id: number;
  nome: string;
  chapa: string;
  funcao: string;
  setor: string;
  email?: string;
  cnpj?: string;
  cpf?: string;
  situacao?: 'ATIVO' | 'DEMITIDO' | 'FERIAS' | 'AFASTADO';
  last_contract_date?: string; // Data ISO
}


export interface Movimentacao {
  id: number;
  tipoMovimento?: string;
  dataMovimento: string;
  observacao?: string;
  setor?: string;
  anexo?: string;

  idEquipamento?: {
    id: number;
    patrimonio?: string;
    modelo?: string;
  };

  idColaborador?: {
    id: number;
    nome?: string;
    setor?: string;
  };
}


export interface Contrato {
  id: number;
  id_colaborador: number;
  data_geracao: string;
  arquivo_url: string;
  movimentacoes_ids: number[];
}

export interface PecaSucata {
  id: number;
  nome: string;
  serial?: string;
  id_ativo_origem: number; // Vinculado ao Ativo que virou sucata
  status: 'Disponivel' | 'Utilizada' | 'Descartada' | 'Reservado';
  data_retirada: string;
}

export interface NotaFiscal {
  id: number;
  numero: string;
  serie?: string;
  chaveAcesso?: string;
  fornecedorNome: string;
  fornecedorCnpj?: string;
  fornecedorEndereco?: string;
  dataEmissao: string;
  dataEntrada?: string;
  dataEntrega?: string;
  valorTotal: number;

  // File fields
  nomeArquivo?: string;
  caminhoArquivo?: string;
  tipoArquivo?: string;
  tamanhoArquivo?: number;

  equipamentos?: Ativo[];
}

export interface ItemNF {
  id: number;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  id_nf: number;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
}

export interface Localizacao {
  id: number;
  nome: string;
  endereco?: string;
}


