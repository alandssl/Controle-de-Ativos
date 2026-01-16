'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Laptop, Users, ArrowLeftRight, Recycle, FileText, CheckCircle2, Wrench, Plus, Monitor } from "lucide-react";
import { Ativo, Movimentacao, Colaborador, PecaSucata, NotaFiscal } from "@/types";
import { api, ENDPOINTS } from '@/services/api';

export default function Home() {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [pecasSucata, setPecasSucata] = useState<PecaSucata[]>([]);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomMessage, setRandomMessage] = useState("");

  useEffect(() => {
    const messages = [
      "Tenha um excelente dia de trabalho!",
      "Que tal revisar o status dos ativos hoje?",
      "Mantenha o inventário sempre atualizado.",
      "A organização é a chave para a eficiência.",
      "Tudo pronto para mais um dia produtivo?",
      "Não esqueça de verificar as últimas movimentações.",
      "Seu trabalho faz toda a diferença!",
      "Controle total, resultados máximos.",
      "Vamos garantir que tudo esteja em ordem?",
      "Hoje é um ótimo dia para organizar!",
    ];
    setRandomMessage(messages[Math.floor(Math.random() * messages.length)]);

    const fetchData = async () => {
      try {
        const [ativosData, movData, colabData, scrapData, nfData] = await Promise.all([
          api.get(ENDPOINTS.ASSETS).catch(e => { console.error("Error fetching assets", e); return []; }),
          api.get(ENDPOINTS.MOVEMENTS).catch(e => { console.error("Error fetching movements", e); return []; }),
          api.get(ENDPOINTS.EMPLOYEES).catch(e => { console.error("Error fetching employees", e); return []; }),
          api.get(ENDPOINTS.SCRAP).catch(e => { console.error("Error fetching scrap", e); return []; }),
          api.get(ENDPOINTS.INVOICES).catch(e => { console.error("Error fetching invoices", e); return []; })
        ]);

        // Safer data extraction - handles both array responses and paginated { content: [...] } responses
        setAtivos(Array.isArray(ativosData) ? ativosData : ativosData?.content || []);
        setMovimentacoes(Array.isArray(movData) ? movData : movData?.content || []);
        setColaboradores(Array.isArray(colabData) ? colabData : colabData?.content || []);
        setPecasSucata(Array.isArray(scrapData) ? scrapData : scrapData?.content || []);
        setNotasFiscais(Array.isArray(nfData) ? nfData : nfData?.content || []);

      } catch (error) {
        console.error("Critical error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // KPIs
  const totalAtivos = ativos.length;
  const ativosDisponiveis = ativos.filter(a => a.status_desc === 'Disponível' || a.status_desc === 'Novo').length;
  const ativosEmUso = ativos.filter(a => a.status_desc === 'Em Uso').length;
  const ativosManutencao = ativos.filter(a => a.status_desc === 'Em Manutenção' || a.status_desc === 'Quebrado').length;

  const totalColaboradores = colaboradores.length;
  const colabAtivos = colaboradores.length;

  const totalMovimentacoes = movimentacoes.length;
  const ultimaMovimentacao = movimentacoes.length > 0
    ? new Date(Math.max(...movimentacoes.map(m => new Date(m.dataMovimento).getTime()))).toLocaleDateString()
    : '-';

  const totalSucata = pecasSucata.length;
  const pecasDisponiveis = pecasSucata.filter(p => p.status === 'Disponivel').length;

  const totalNotas = notasFiscais.length;
  const valorTotalInvestido = notasFiscais.reduce((acc, nf) => acc + (nf.valorTotal || 0), 0);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="flex flex-col gap-1 pb-2">
        <div className="flex items-center gap-3">
          <Monitor className="h-8 w-8 text-blue-600" />
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent uppercase">
            Sistema Controle de Ativos
          </h2>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Bem-vindo, Raphael Araujo</h1>
        {randomMessage && (
          <p className="text-xs text-muted-foreground/80 italic animate-in slide-in-from-left-2 duration-500">
            "{randomMessage}"
          </p>
        )}
        <p className="text-muted-foreground text-sm flex items-center gap-2">
          Administrador do Sistema • Tecnologia da Informação
        </p>
      </div>

      {/* Grid Expandido em 2 linhas de 4 colunas (lg) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* --- LINHA 1 --- */}

        {/* 1. Ativos Totais */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-600 overflow-hidden h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Link href="/assets" className="flex items-center gap-2 flex-1 no-underline group" title="Ver lista de Ativos">
              <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground group-hover:text-blue-600 transition-colors">Total Ativos</CardTitle>
              <Laptop className="h-4 w-4 text-blue-600" />
            </Link>
            <Link href="/assets/new" className="no-underline">
              <Button variant="outline" size="sm" className="h-7 gap-1 px-3 text-xs flex items-center justify-center" title="Cadastrar Ativo">
                <Plus className="h-3.5 w-3.5" /> Novo Ativo
              </Button>
            </Link>
          </CardHeader>
          <Link href="/assets" className="block flex-1 no-underline">
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalAtivos}</div>
              <p className="text-xs text-muted-foreground mt-1">Inventário completo</p>
            </CardContent>
          </Link>
        </Card>

        {/* 2. Em Uso (Sem botão de cadastro, apenas filtro) */}
        <Link href="/assets?status=Em%20Uso" className="no-underline group">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500 cursor-pointer overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Em Uso</CardTitle>
              <Activity className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ativosEmUso}</div>
              <p className="text-xs text-muted-foreground mt-1">Alocados a colaboradores</p>
            </CardContent>
          </Card>
        </Link>

        {/* 3. Colaboradores */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-violet-500 overflow-hidden h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Link href="/employees" className="flex items-center gap-2 flex-1 no-underline group" title="Ver lista de Colaboradores">
              <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground group-hover:text-violet-500 transition-colors">Colaboradores</CardTitle>
              <Users className="h-4 w-4 text-violet-500" />
            </Link>
            <Link href="/employees/new" className="no-underline">
              <Button variant="outline" size="sm" className="h-7 gap-1 px-3 text-xs flex items-center justify-center" title="Cadastrar Colaborador">
                <Plus className="h-3.5 w-3.5" /> Novo Colaborador
              </Button>
            </Link>
          </CardHeader>
          <Link href="/employees" className="block flex-1 no-underline">
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalColaboradores}</div>
              <p className="text-xs text-muted-foreground mt-1">{colabAtivos} ativos</p>
            </CardContent>
          </Link>
        </Card>

        {/* 4. Movimentações */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500 overflow-hidden h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Link href="/movements" className="flex items-center gap-2 flex-1 no-underline group" title="Ver Movimentações">
              <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground group-hover:text-orange-500 transition-colors">Movimentações</CardTitle>
              <ArrowLeftRight className="h-4 w-4 text-orange-500" />
            </Link>
            <Link href="/movements/new" className="no-underline">
              <Button variant="outline" size="sm" className="h-7 gap-1 px-3 text-xs flex items-center justify-center" title="Nova Movimentação">
                <Plus className="h-3.5 w-3.5" /> Nova Movimentação
              </Button>
            </Link>
          </CardHeader>
          <Link href="/movements" className="block flex-1 no-underline">
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalMovimentacoes}</div>
              <p className="text-xs text-muted-foreground mt-1">Última: {ultimaMovimentacao}</p>
            </CardContent>
          </Link>
        </Card>


        {/* --- LINHA 2 --- */}

        {/* 5. Disponíveis */}
        <Link href="/assets?status=Disponivel" className="no-underline group">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500 cursor-pointer overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Disponíveis</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{ativosDisponiveis}</div>
              <p className="text-xs text-muted-foreground mt-1">Prontos para uso</p>
            </CardContent>
          </Card>
        </Link>

        {/* 6. Manutenção */}
        <Link href="/assets?status=Manutencao" className="no-underline group">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500 cursor-pointer overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Manutenção</CardTitle>
              <Wrench className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{ativosManutencao}</div>
              <p className="text-xs text-muted-foreground mt-1">Reparo necessário</p>
            </CardContent>
          </Card>
        </Link>

        {/* 7. Sucata */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-rose-500 overflow-hidden h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Link href="/scrap" className="flex items-center gap-2 flex-1 no-underline group" title="Ver Sucata">
              <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground group-hover:text-rose-500 transition-colors">Sucata</CardTitle>
              <Recycle className="h-4 w-4 text-rose-500" />
            </Link>
            <Link href="/scrap/new" className="no-underline">
              <Button variant="outline" size="sm" className="h-7 gap-1 px-3 text-xs flex items-center justify-center" title="Cadastrar Sucata">
                <Plus className="h-3.5 w-3.5" /> Nova Sucata
              </Button>
            </Link>
          </CardHeader>
          <Link href="/scrap" className="block flex-1 no-underline">
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalSucata}</div>
              <p className="text-xs text-muted-foreground mt-1">{pecasDisponiveis} reaproveitáveis</p>
            </CardContent>
          </Link>
        </Card>

        {/* 8. Investimento/Notas */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-teal-500 overflow-hidden h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Link href="/invoices" className="flex items-center gap-2 flex-1 no-underline group" title="Ver Notas Fiscais">
              <CardTitle className="text-sm font-bold tracking-wide uppercase text-muted-foreground group-hover:text-teal-500 transition-colors">Investimento</CardTitle>
              <FileText className="h-4 w-4 text-teal-500" />
            </Link>
            <Link href="/invoices/new" className="no-underline">
              <Button variant="outline" size="sm" className="h-7 gap-1 px-3 text-xs flex items-center justify-center" title="Cadastrar Nota Fiscal">
                <Plus className="h-3.5 w-3.5" /> Nova Nota
              </Button>
            </Link>
          </CardHeader>
          <Link href="/invoices" className="block flex-1 no-underline">
            <CardContent>
              <div className="text-xl font-bold truncate text-foreground" title={`R$ ${valorTotalInvestido}`}>
                R$ {new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(valorTotalInvestido)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{totalNotas} notas fiscais</p>
            </CardContent>
          </Link>
        </Card>

      </div>
    </div>
  );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
