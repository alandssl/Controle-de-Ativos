'use client'; // Indica que este é um componente Client Side do Next.js

import { use } from 'react'; // Importa hook use do React para resolver Promises (ex: params)
import Link from 'next/link'; // Importa componente Link para navegação interna
import { ArrowLeft, FileCheck, FileWarning, Printer } from 'lucide-react'; // Importa ícones da biblioteca Lucide
import { Button } from '@/components/ui/button'; // Importa componente de botão da UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Importa componentes de cartão da UI
import { Badge } from '@/components/ui/badge'; // Importa componente de Badge (selo) da UI
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'; // Importa componentes de tabela
import { mockColaboradores, mockAtivos, mockMovimentacoes } from '@/lib/data'; // Importa dados mockados (falsos) para teste/protótipo

interface PageProps { // Define a interface para as props da página
    params: Promise<{ id: string }>; // Params é uma Promise contendo o id da rota dinâmica
}

export default function EmployeeDetailsPage({ params }: PageProps) { // Componente principal da página de detalhes do funcionário
    const resolvedParams = use(params); // Resolve a promise dos parâmetros para acessar o ID
    const employeeId = parseInt(resolvedParams.id); // Converte o ID de string para número
    const employee = mockColaboradores.find(e => e.id === employeeId); // Busca o colaborador correspondente nos dados mockados

    if (!employee) { // Se o funcionário não for encontrado
        return <div>Funcionário não encontrado</div>; // Retorna mensagem de erro simples
    }

    // Encontra ativos atribuídos atualmente (Lógica: Última movimentação foi 'Saída' para este funcionário)
    // Lógica simplificada para protótipo: Checa movimentações onde o id_colaborador coincide e o tipo é 'Saída'
    // Em um app real, consultaríamos o status do Ativo diretamente ou teríamos uma query mais inteligente.
    const assignments = mockMovimentacoes.filter(m => m.idColaborador?.id === employee.id && m.tipoMovimento === 'Saida'); // Filtra movimentações de saída para este colaborador

    // Resolve os detalhes dos ativos baseados nessas movimentações
    const assignedAssets = assignments.map(assignment => { // Mapeia cada atribuição para buscar os detalhes do ativo
        const asset = mockAtivos.find(a => a.id === assignment.idEquipamento?.id); // Busca o ativo pelo ID no mock de ativos
        return { ...asset, assignmentDate: assignment.dataMovimento }; // Retorna o ativo combinado com a data da movimentação
    }).filter(Boolean); // Remove quaisquer ativos não encontrados (null/undefined)

    // Lógica do Contrato
    const lastContract = employee.last_contract_date ? new Date(employee.last_contract_date) : null; // Pega a data do último contrato, se existir
    const latestAssignmentDate = assignments.length > 0
        ? new Date(Math.max(...assignments.map(a => new Date(a.dataMovimento).getTime()))) // Pega a data da movimentação mais recente, se houver movimentações
        : null; // Caso contrário, null

    const isContractOutdated = !lastContract || (latestAssignmentDate && latestAssignmentDate > lastContract); // Verifica se o contrato está desatualizado (se existe movimentação posterior ao contrato)

    return ( // Renderização da UI
        <div className="space-y-6"> {/* Container principal com espaçamento vertical */}
            <div className="flex items-center gap-4"> {/* Cabeçalho com botão de voltar e informações */}
                <Link href="/employees"> {/* Link para voltar para lista de funcionários */}
                    <Button variant="ghost" size="icon"> {/* Botão estilo 'ghost' (sem fundo) com ícone */}
                        <ArrowLeft className="h-4 w-4" /> {/* Ícone de seta para esquerda */}
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{employee.nome}</h1> {/* Nome do funcionário em destaque */}
                    <p className="text-sm text-muted-foreground">{employee.funcao} - {employee.setor}</p> {/* Função e setor com cor suave */}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2"> {/* Grid de layouts (2 colunas em telas médias+) */}
                <Card> {/* Cartão de Status do Contrato */}
                    <CardHeader>
                        <CardTitle>Status do Contrato</CardTitle> {/* Título do cartão */}
                    </CardHeader>
                    <CardContent className="space-y-4"> {/* Conteúdo com espaçamento */}
                        {/* Caixa de status colorida condicionalmente (amarelo se desatualizado, verde se ok) */}
                        <div className={`p-4 rounded-md border flex items-start gap-4 ${isContractOutdated ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                            {isContractOutdated ? ( // Ícone condicional
                                <FileWarning className="h-6 w-6 text-amber-500 mt-1" /> // Ícone de alerta
                            ) : (
                                <FileCheck className="h-6 w-6 text-emerald-500 mt-1" /> // Ícone de check
                            )}
                            <div>
                                <h3 className={`font-semibold ${isContractOutdated ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    {isContractOutdated ? 'Contrato Desatualizado' : 'Contrato Atualizado'} {/* Texto do status */}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1"> {/* Descrição do status */}
                                    {isContractOutdated
                                        ? 'Existem movimentações recentes não cobertas pelo último contrato gerado.'
                                        : `Último contrato gerado em ${lastContract?.toLocaleDateString()}.`}
                                </p>
                            </div>
                        </div>

                        <Button className="w-full" variant={isContractOutdated ? 'default' : 'outline'}> {/* Botão par gerar termo (destaque se necessário) */}
                            <Printer className="mr-2 h-4 w-4" /> {/* Ícone de impressora */}
                            Gerar Novo Termo de Responsabilidade
                        </Button>
                    </CardContent>
                </Card>

                <Card> {/* Cartão de Informações Pessoais */}
                    <CardHeader>
                        <CardTitle>Informações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm"> {/* Lista de informações compacta */}
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Chapa</span>
                            <span className="font-medium">{employee.chapa}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Email</span>
                            <span className="font-medium">{employee.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Data Admissão</span>
                            <span className="font-medium">01/01/2023</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card> {/* Cartão de Ativos em Posse */}
                <CardHeader>
                    <CardTitle>Ativos em Posse</CardTitle>
                </CardHeader>
                <CardContent>
                    {assignedAssets.length > 0 ? ( // Se houver ativos atribuídos, mostra tabela
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patrimônio</TableHead>
                                    <TableHead>Modelo</TableHead>
                                    <TableHead>Data Entrega</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignedAssets.map((asset: any) => ( // Itera sobre os ativos para criar linhas na tabela
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-medium">{asset.patrimonio}</TableCell>
                                        <TableCell>{asset.modelo}</TableCell>
                                        <TableCell>{new Date(asset.assignmentDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge>{asset.status_desc}</Badge> {/* Badge com o status do ativo */}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : ( // Se não houver ativos, mostra mensagem
                        <div className="text-center py-6 text-muted-foreground">
                            Nenhum ativo atribuído a este colaborador.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

