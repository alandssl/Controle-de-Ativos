'use client';

import { use, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, History, User, Laptop, Info, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, ENDPOINTS } from '@/services/api';
import { Movimentacao, Ativo, Colaborador } from '@/types';
import { useReactToPrint } from 'react-to-print';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function MovementDetailsPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const movId = parseInt(resolvedParams.id);

    // Estados para dados reais
    const [movement, setMovement] = useState<Movimentacao | null>(null);
    const [asset, setAsset] = useState<Ativo | null>(null);
    const [collaborator, setCollaborator] = useState<Colaborador | null>(null);
    const [loading, setLoading] = useState(true);

    // Ref para impressão
    const printRef = useRef<HTMLDivElement>(null);

    // Função de Imprimir
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Comprovante_Movimentacao_${movId}`,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Busca a movimentação
                const movData = await api.get(`${ENDPOINTS.MOVEMENTS}/${movId}`);
                if (!movData) {
                    setLoading(false);
                    return;
                }
                setMovement(movData);

                // Busca detalhes relacionados se existirem IDs na movimentação
                // Nota: A API de movimentos já traz alguns dados alinhados, mas vamos garantir
                // Se a API retornar objeto aninhado completo, usamos ele.
                if (movData.idEquipamento) {
                    // Se for objeto completo
                    if (typeof movData.idEquipamento === 'object') {
                        setAsset(movData.idEquipamento);
                    } else {
                        // Se for só ID (dependendo da API), buscaria
                        const assetData = await api.get(`${ENDPOINTS.ASSETS}/${movData.idEquipamento}`);
                        setAsset(assetData);
                    }
                }

                if (movData.idColaborador) {
                    if (typeof movData.idColaborador === 'object') {
                        setCollaborator(movData.idColaborador);
                    } else {
                        const colabData = await api.get(`${ENDPOINTS.EMPLOYEES}/${movData.idColaborador}`);
                        setCollaborator(colabData);
                    }
                }

            } catch (error) {
                console.error("Erro ao buscar detalhes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [movId]);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Carregando detalhes...</div>;
    }

    if (!movement) {
        notFound();
    }

    // Lógica visual baseada nos dados
    const isSaida = movement.tipoMovimento === 'Saida' || (!movement.idColaborador && movement.tipoMovimento !== 'Entrada');
    // Ajuste da lógica de exibição conforme regras anteriores:
    // Se tem colaborador -> Saida/Entrega
    // Se não tem (ou é estoque) -> Entrada/Devolução
    // Vamos confiar no 'tipoMovimento' que vem do banco, mas fallback para lógica visual se precisar

    const displayType = movement.tipoMovimento === 'Saida' ? 'Entrega de Equipamento' : 'Devolução de Equipamento';
    const displayCollaboratorName = collaborator ? collaborator.nome : 'ESTOQUE TI';

    return (
        <div className="space-y-6">
            {/* Header com Navegação e Botão de Imprimir */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/movements">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <History className="h-6 w-6" />
                            Detalhes da Movimentação #{movement.id}
                        </h1>
                    </div>
                </div>
                <Button onClick={() => handlePrint && handlePrint()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Comprovante
                </Button>
            </div>

            {/* ÁREA IMPRIMÍVEL */}
            <div className="bg-white p-8 rounded-lg border shadow-sm print:shadow-none print:border-none" ref={printRef}>

                {/* Cabeçalho do Comprovante */}
                <div className="flex items-center justify-between bg-gray-50 p-6 rounded-lg border mb-6 print:bg-transparent print:border-gray-300">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center print:border print:border-gray-200">
                            <Laptop className="h-6 w-6 text-primary print:text-black" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Termo de Movimentação</h2>
                            <p className="text-sm text-gray-500">Controle de Ativos de TI</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <Badge variant="outline" className="mb-1 text-lg px-3 py-1 font-bold border-2">
                            {displayType.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-gray-400">ID: {movement.id}</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Seção 1: Dados da Operação */}
                    <section>
                        <div className="bg-gray-50 p-6 rounded-lg border print:bg-transparent print:border-gray-300">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
                                <Info className="h-4 w-4" /> Dados da Operação
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-sm">
                                    <span className="font-semibold text-gray-600">Data e Hora:</span>&nbsp;
                                    <span className="text-gray-900">
                                        {new Date(movement.dataMovimento).toLocaleDateString()} às {new Date(movement.dataMovimento).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold text-gray-600">Status:</span>&nbsp;
                                    <span className="text-gray-900">Concluído</span>
                                </div>

                                <div className="text-sm">
                                    <span className="font-semibold text-gray-600">Origem:</span>&nbsp;
                                    <span className="text-gray-900">
                                        {movement.tipoMovimento === 'Saida' ? 'ESTOQUE TI' : (movement.setor || 'Usuário / Externo')}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold text-gray-600">Destino:</span>&nbsp;
                                    <span className="text-gray-900">
                                        {movement.tipoMovimento === 'Saida' ? (collaborator?.nome || 'Destinatário') : 'ESTOQUE TI'}
                                    </span>
                                </div>

                                <div className="col-span-1 md:col-span-2 text-sm">
                                    <span className="font-semibold text-gray-600">Observações:</span>&nbsp;
                                    <span className="text-gray-900 italic">
                                        {movement.observacao || 'Nenhuma observação registrada.'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Seção 2: Ativo e Responsável */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ativo */}
                    <section className="flex flex-col h-full">
                        <div className="border rounded-lg p-6 h-full print:border-gray-300">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
                                <Laptop className="h-4 w-4" /> Equipamento
                            </h3>
                            {asset ? (
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="font-semibold text-gray-600">Patrimônio:</span>&nbsp;
                                        <span className="font-bold text-gray-900 text-lg">{asset.patrimonio}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-600">Modelo:</span>&nbsp;
                                        <span className="text-gray-900">{asset.modelo}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-600">Fabricante:</span>&nbsp;
                                        <span className="text-gray-900">{asset.fabricante || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-600">Tipo:</span>&nbsp;
                                        <span className="text-gray-900">{asset.tipoEquipamento?.tipo || 'Outros'}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-red-500">Dados do ativo não disponíveis.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Colaborador */}
                    <section className="flex flex-col h-full">
                        <div className="border rounded-lg p-6 h-full print:border-gray-300">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6 flex items-center gap-2">
                                <User className="h-4 w-4" /> Responsável / Destino
                            </h3>
                            {collaborator ? (
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="font-semibold text-gray-600">Nome:</span>&nbsp;
                                        <span className="font-bold text-gray-900 text-lg">{collaborator.nome}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-600">Setor:</span>&nbsp;
                                        <span className="text-gray-900">{collaborator.setor}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-600">Chapa:</span>&nbsp;
                                        <span className="text-gray-900">{collaborator.chapa}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-600">Função:</span>&nbsp;
                                        <span className="text-gray-900">{collaborator.funcao || '-'}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col justify-center items-center text-center p-4 bg-gray-50 rounded print:bg-transparent">
                                    <span className="text-2xl font-bold text-gray-700 mb-2">ESTOQUE TI</span>
                                    <span className="text-sm text-gray-500 max-w-[200px]">Equipamento atualmente em posse do departamento de TI</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Rodapé de Assinatura (Apenas visível na impressão normalmente, mas deixaremos visível aqui também pra preview) */}
                <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-300 print:block">
                    <div className="grid grid-cols-2 gap-16 text-center">
                        <div>
                            <div className="border-b border-gray-400 mb-2 h-8"></div>
                            <p className="text-sm font-medium">Assinatura do Responsável (TI)</p>
                        </div>
                        <div>
                            <div className="border-b border-gray-400 mb-2 h-8"></div>
                            <p className="text-sm font-medium">Assinatura do Usuário / Recebedor</p>
                        </div>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-8">
                        Documento gerado eletronicamente pelo sistema de Controle de Ativos em {new Date().toLocaleDateString()}.
                    </p>
                </div>
            </div>
        </div>
    );
}
