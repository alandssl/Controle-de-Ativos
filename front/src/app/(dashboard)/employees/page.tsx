'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus, Search, FileDown, Eye, Edit, Settings2
} from 'lucide-react';


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from '@/components/ui/table';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableFilter } from '@/components/ui/data-table-filter';
import { SortIcon } from '@/components/ui/sort-icon';

import { Colaborador } from '@/types';
import { api, ENDPOINTS } from '@/services/api';

export default function EmployeesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [visibleColumns, setVisibleColumns] = useState({
        nome: true,
        chapa: true,
        funcao: true,
        setor: true,
        email: true,
        situacao: true,
    });
    const [sortConfig, setSortConfig] =
        useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [loading, setLoading] = useState(true);



    const employeeStatuses = [
        { label: 'Ativo', value: 'ATIVO' },
        { label: 'Demitido', value: 'DEMITIDO' },
        { label: 'Férias', value: 'FERIAS' },
        { label: 'Afastado', value: 'AFASTADO' }
    ];

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await api.get(ENDPOINTS.EMPLOYEES);
                const employeesList = data?.content ?? (Array.isArray(data) ? data : []);
                setColaboradores(employeesList);
            } catch (error) {
                console.error('Erro ao buscar colaboradores:', error);
                setColaboradores([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);



    const filteredEmployees = colaboradores.filter(employee => {
        const matchesSearch =
            employee.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.chapa.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employee.email && employee.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
            selectedStatuses.length === 0 ||
            selectedStatuses.includes(employee.situacao || '');

        return matchesSearch && matchesStatus;
    });

    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        if (!sortConfig) return 0;

        const { key, direction } = sortConfig;
        let valueA: any = '';
        let valueB: any = '';

        switch (key) {
            case 'nome':
                valueA = a.nome;
                valueB = b.nome;
                break;
            case 'chapa':
                valueA = a.chapa;
                valueB = b.chapa;
                break;
            case 'funcao':
                valueA = a.funcao;
                valueB = b.funcao;
                break;
            case 'setor':
                valueA = a.setor;
                valueB = b.setor;
                break;
            case 'email':
                valueA = a.email || '';
                valueB = b.email || '';
                break;
            case 'situacao':
                valueA = a.situacao || '';
                valueB = b.situacao || '';
                break;
            default:
                return 0;
        }

        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Colaboradores</h1>
                    <p className="text-sm text-muted-foreground">Gerencie o quadro de funcionários.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <Link href="/employees/new">
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Colaborador
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Lista de Funcionários</CardTitle>
                            <CardDescription>
                                Total de {colaboradores.length} colaboradores cadastrados.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome, chapa..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <DataTableFilter
                                title="Situação"
                                options={employeeStatuses}
                                selectedValues={selectedStatuses}
                                onSelect={setSelectedStatuses}
                            />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" title="Colunas">
                                        <Settings2 className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Colunas</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, nome: !prev.nome }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.nome} readOnly />
                                            <span>Nome</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, chapa: !prev.chapa }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.chapa} readOnly />
                                            <span>Chapa</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, funcao: !prev.funcao }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.funcao} readOnly />
                                            <span>Função</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, setor: !prev.setor }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.setor} readOnly />
                                            <span>Setor</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, email: !prev.email }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.email} readOnly />
                                            <span>Email</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setVisibleColumns(prev => ({ ...prev, situacao: !prev.situacao }))}>
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={visibleColumns.situacao} readOnly />
                                            <span>Situação</span>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {visibleColumns.nome && (
                                        <TableHead>
                                            <div
                                                className="flex items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('nome')}
                                            >
                                                Nome
                                                <SortIcon column="nome" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.chapa && (
                                        <TableHead>
                                            <div
                                                className="flex items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('chapa')}
                                            >
                                                Chapa
                                                <SortIcon column="chapa" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.funcao && (
                                        <TableHead>
                                            <div
                                                className="flex items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('funcao')}
                                            >
                                                Função
                                                <SortIcon column="funcao" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.setor && (
                                        <TableHead>
                                            <div
                                                className="flex items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('setor')}
                                            >
                                                Setor
                                                <SortIcon column="setor" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.email && (
                                        <TableHead>
                                            <div
                                                className="flex items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('email')}
                                            >
                                                Email
                                                <SortIcon column="email" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    {visibleColumns.situacao && (
                                        <TableHead>
                                            <div
                                                className="flex items-center cursor-pointer select-none hover:text-foreground"
                                                onClick={() => handleSort('situacao')}
                                            >
                                                Situação
                                                <SortIcon column="situacao" sortConfig={sortConfig} />
                                            </div>
                                        </TableHead>
                                    )}
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">
                                            Carregando dados...
                                        </TableCell>
                                    </TableRow>
                                ) : sortedEmployees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">
                                            Nenhum colaborador encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedEmployees.map((employee) => (
                                        <TableRow key={employee.id}>
                                            {visibleColumns.nome && (
                                                <TableCell className="font-medium">{employee.nome}</TableCell>
                                            )}
                                            {visibleColumns.chapa && (
                                                <TableCell>{employee.chapa}</TableCell>
                                            )}
                                            {visibleColumns.funcao && (
                                                <TableCell>{employee.funcao}</TableCell>
                                            )}
                                            {visibleColumns.setor && (
                                                <TableCell>{employee.setor}</TableCell>
                                            )}
                                            {visibleColumns.email && (
                                                <TableCell>{employee.email || '-'}</TableCell>
                                            )}
                                            {visibleColumns.situacao && (
                                                <TableCell>
                                                    <Badge variant={
                                                        employee.situacao === 'ATIVO' ? 'default' :
                                                            employee.situacao === 'DEMITIDO' ? 'destructive' : 'secondary'
                                                    }>
                                                        {employee.situacao}
                                                    </Badge>
                                                </TableCell>
                                            )}
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Link href={`/employees/${employee.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver Detalhes">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/employees/${employee.id}/edit`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Editar">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {/* Botão excluir removido a pedido */}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
