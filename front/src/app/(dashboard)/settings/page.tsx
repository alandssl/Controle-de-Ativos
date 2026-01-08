'use client';

import { useState } from 'react';
import { Settings, FolderTree, MapPin, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GeneralSettings } from './components/general-settings';
import { CategoriesSettings } from './components/categories-settings';
import { LocationsSettings } from './components/locations-settings';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'locations'>('general');

    const renderContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralSettings />;
            case 'categories': return <CategoriesSettings />;
            case 'locations': return <LocationsSettings />;
            default: return <GeneralSettings />;
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Gerencie preferências, categorias e localizações do sistema.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-64 flex-shrink-0">
                    <nav className="flex flex-col space-y-1">
                        <Button
                            variant={activeTab === 'general' ? 'secondary' : 'ghost'}
                            className="justify-start gap-2"
                            onClick={() => setActiveTab('general')}
                        >
                            <Sliders className="h-4 w-4" />
                            Geral
                        </Button>
                        <Button
                            variant={activeTab === 'categories' ? 'secondary' : 'ghost'}
                            className="justify-start gap-2"
                            onClick={() => setActiveTab('categories')}
                        >
                            <FolderTree className="h-4 w-4" />
                            Categorias
                        </Button>
                        <Button
                            variant={activeTab === 'locations' ? 'secondary' : 'ghost'}
                            className="justify-start gap-2"
                            onClick={() => setActiveTab('locations')}
                        >
                            <MapPin className="h-4 w-4" />
                            Localizações
                        </Button>
                    </nav>
                </aside>

                <main className="flex-1 min-w-0">
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}
