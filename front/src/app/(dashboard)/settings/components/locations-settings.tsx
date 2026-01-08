'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotifications } from '@/providers/notification-provider';
import { api, ENDPOINTS } from '@/services/api';

interface Location {
    id: number;
    nome: string;
    endereco?: string;
}

export function LocationsSettings() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addNotification } = useNotifications();

    // New Location State
    const [newLocationName, setNewLocationName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const data = await api.get(ENDPOINTS.LOCATIONS);
            setLocations(data.content ?? data);
        } catch (error) {
            console.error('Failed to fetch locations', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Tem certeza que deseja excluir esta localização?')) return;

        try {
            await api.delete(`${ENDPOINTS.LOCATIONS}/${id}`);
            setLocations(prev => prev.filter(l => l.id !== id));
            addNotification({
                title: 'Sucesso',
                message: 'Localização excluída com sucesso.',
                type: 'success'
            });
        } catch (error) {
            console.error('Error deleting location', error);
            addNotification({
                title: 'Erro',
                message: 'Não foi possível excluir a localização.',
                type: 'error'
            });
        }
    };

    const handleCreate = async () => {
        if (!newLocationName.trim()) return;

        try {
            setIsCreating(true);
            const newLoc = await api.post(ENDPOINTS.LOCATIONS, { nome: newLocationName });
            setLocations(prev => [...prev, newLoc]);
            setNewLocationName('');
            addNotification({
                title: 'Sucesso',
                message: 'Localização criada com sucesso.',
                type: 'success'
            });
        } catch (error) {
            console.error('Error creating location', error);
            addNotification({
                title: 'Erro',
                message: 'Erro ao criar localização.',
                type: 'error'
            });
        } finally {
            setIsCreating(false);
        }
    };

    const filteredLocations = locations.filter(l =>
        l.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gerenciar Localizações</CardTitle>
                <CardDescription>Defina locais físicos, unidades ou filiais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input
                            placeholder="Nova Localização..."
                            value={newLocationName}
                            onChange={(e) => setNewLocationName(e.target.value)}
                        />
                        <Button onClick={handleCreate} disabled={isCreating || !newLocationName.trim()}>
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
                            ) : filteredLocations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">Nenhuma localização encontrada.</TableCell>
                                </TableRow>
                            ) : (
                                filteredLocations.map(location => (
                                    <TableRow key={location.id}>
                                        <TableCell className="w-[80px] font-mono text-xs">{location.id}</TableCell>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            {location.nome}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(location.id)}
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
