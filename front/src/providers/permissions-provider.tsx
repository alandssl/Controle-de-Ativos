'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type PermissionKey = 'dashboard' | 'assets' | 'movements' | 'employees' | 'scrap' | 'invoices' | 'settings';

interface PermissionsContextType {
    permissions: Record<PermissionKey, boolean>;
    togglePermission: (key: PermissionKey) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const defaultPermissions: Record<PermissionKey, boolean> = {
    dashboard: true,
    assets: true,
    movements: true,
    employees: true,
    scrap: true,
    invoices: true,
    settings: true,
};

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
    const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>(defaultPermissions);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('app_permissions');
        if (stored) {
            try {
                setPermissions(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse permissions", e);
            }
        }
        setIsLoaded(true);
    }, []);

    const togglePermission = (key: PermissionKey) => {
        setPermissions(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem('app_permissions', JSON.stringify(next));
            return next;
        });
    };

    if (!isLoaded) {
        return null; // Or a loading spinner preventing flash of restricted content
    }

    return (
        <PermissionsContext.Provider value={{ permissions, togglePermission }}>
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissions() {
    const context = useContext(PermissionsContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within a PermissionsProvider');
    }
    return context;
}
