import { Ativo, Colaborador, Movimentacao } from '@/types';

export const mockAtivos: Ativo[] = [
    { id: 1, patrimonio: 'ATV-001', modelo: 'Dell Latitude 5420', data_aquisicao: '2024-01-15', id_categoria: 1, status: { id: 1, descricao: 'Em Uso' }, status_desc: 'Em Uso', especificacoes: { ram: '16GB', cpu: 'i5-1135G7' } },
    { id: 2, patrimonio: 'ATV-002', modelo: 'Dell Latitude 5420', data_aquisicao: '2024-01-15', id_categoria: 1, status: { id: 1, descricao: 'Disponível' }, status_desc: 'Disponível', especificacoes: { ram: '16GB', cpu: 'i5-1135G7' } },
    { id: 3, patrimonio: 'ATV-003', modelo: 'Iphone 13', data_aquisicao: '2024-03-10', id_categoria: 2, status: { id: 3, descricao: 'Em Manutenção' }, status_desc: 'Em Manutenção', especificacoes: { storage: '128GB' } },
    { id: 4, patrimonio: 'ATV-004', modelo: 'Monitor Dell 24', data_aquisicao: '2023-11-20', id_categoria: 3, status: { id: 4, descricao: 'Sucata' }, status_desc: 'Sucata', especificacoes: {} },
];

export const mockColaboradores: Colaborador[] = [
    { id: 1, nome: 'Vitor Lemos', chapa: '12345', funcao: 'Desenvolvedor', setor: 'TI', last_contract_date: '2024-02-01T10:00:00Z', cnpj: '12.345.678/0001-90', cpf: '123.456.789-00', situacao: 'ATIVO' },
    { id: 2, nome: 'Ana Silva', chapa: '12346', funcao: 'Analista RH', setor: 'RH', last_contract_date: '2024-03-01T09:00:00Z', cnpj: '98.765.432/0001-10', cpf: '987.654.321-00', situacao: 'FERIAS' },
    { id: 3, nome: 'Carlos Souza', chapa: '12347', funcao: 'Gerente', setor: 'Financeiro', last_contract_date: undefined, cnpj: '45.678.901/0001-23', cpf: '456.789.012-00', situacao: 'DEMITIDO' },
];

export const mockMovimentacoes: Movimentacao[] = [
    {
        id: 1,
        dataMovimento: '2024-02-10T14:30:00Z',
        tipoMovimento: 'Saida',
        idEquipamento: { id: 1, patrimonio: 'ATV-001', modelo: 'Dell Latitude 5420' },
        idColaborador: { id: 1, nome: 'Vitor Lemos', setor: 'TI' },
        observacao: 'Entrega notebook novo'
    },
    {
        id: 2,
        dataMovimento: '2024-02-15T14:30:00Z',
        tipoMovimento: 'Saida',
        idEquipamento: { id: 3, patrimonio: 'ATV-003', modelo: 'Iphone 13' },
        idColaborador: { id: 1, nome: 'Vitor Lemos', setor: 'TI' },
        observacao: 'Entrega celular'
    },
];

export const mockPecas = [
    { id: 1, nome: 'Memória RAM 8GB DDR4', serial: 'K829102', id_ativo_origem: 2, status: 'Disponivel', data_retirada: '2024-03-01' },
    { id: 2, nome: 'SSD 256GB NVMe', serial: 'S829102', id_ativo_origem: 2, status: 'Utilizada', data_retirada: '2024-03-01' },
    { id: 3, nome: 'Tela 15.6 FHD', serial: 'T928371', id_ativo_origem: 4, status: 'Reservado', data_retirada: '2024-04-10' },
];

export const mockNotasFiscais = [
    { id: 1, numero: '001.234', fornecedor: 'Dell Computadores do Brasil', data_emissao: '2024-01-10', valor_total: 15000.00, arquivo_url: '/mock-invoice.pdf' },
    { id: 2, numero: '003.567', fornecedor: 'KaBuM! Comércio Eletrônico', data_emissao: '2024-03-05', valor_total: 4500.00, arquivo_url: '/mock-invoice-2.pdf' },
];

export const mockItemsNF = [
    { id: 1, descricao: 'Notebook Dell Latitude 5420 i5 16GB', quantidade: 2, valor_unitario: 5000.00, id_nf: 1 },
    { id: 2, descricao: 'Docking Station Dell WD19', quantidade: 2, valor_unitario: 1500.00, id_nf: 1 },
    { id: 3, descricao: 'Monitor Dell 24 P2419H', quantidade: 2, valor_unitario: 1000.00, id_nf: 1 },
    { id: 4, descricao: 'iPhone 13 128GB Midnight', quantidade: 1, valor_unitario: 4500.00, id_nf: 2 },
];
