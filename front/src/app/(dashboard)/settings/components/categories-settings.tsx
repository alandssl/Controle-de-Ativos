'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotifications } from '@/providers/notification-provider';
import { api, ENDPOINTS } from '@/services/api';

interface Category {
    id: number;
    nome: string;
    // Add other fields if known. detailed description?
    descricao?: string;
}

export function CategoriesSettings() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addNotification } = useNotifications();

    // New Category State
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await api.get(ENDPOINTS.CATEGORIES);
            setCategories(data.content ?? data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria? Isso pode afetar ativos vinculados.')) return;

        try {
            await api.delete(`${ENDPOINTS.CATEGORIES}/${id}`);
            setCategories(prev => prev.filter(c => c.id !== id));
            addNotification({
                title: 'Sucesso',
                message: 'Categoria excluída com sucesso.',
                type: 'success'
            });
        } catch (error) {
            console.error('Error deleting category', error);
            addNotification({
                title: 'Erro',
                message: 'Não foi possível excluir a categoria. Verifique se há ativos vinculados.',
                type: 'error'
            });
        }
    };

    const handleCreate = async () => {
        if (!newCategoryName.trim()) return;

        try {
            setIsCreating(true);
            const newCat = await api.post(ENDPOINTS.CATEGORIES, { nome: newCategoryName });
            setCategories(prev => [...prev, newCat]);
            setNewCategoryName('');
            addNotification({
                title: 'Sucesso',
                message: 'Categoria criada com sucesso.',
                type: 'success'
            });
        } catch (error) {
            console.error('Error creating category', error);
            addNotification({
                title: 'Erro',
                message: 'Erro ao criar categoria.',
                type: 'error'
            });
        } finally {
            setIsCreating(false);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gerenciar Categorias</CardTitle>
                <CardDescription>Adicione ou remova categorias de ativos (ex: Notebooks, Monitores).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                            placeholder="Nova Categoria..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <Button onClick={handleCreate} disabled={isCreating || !newCategoryName.trim()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar
                        </Button>
                    </div>
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">Carregando...</TableCell>
                                </TableRow>
                            ) : filteredCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">Nenhuma categoria encontrada.</TableCell>
                                </TableRow>
                            ) : (
                                filteredCategories.map(category => (
                                    <TableRow key={category.id}>
                                        <TableCell className="w-[80px] font-mono text-xs">{category.id}</TableCell>
                                        <TableCell className="font-medium">{category.nome}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(category.id)}
                                                title="Excluir"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
