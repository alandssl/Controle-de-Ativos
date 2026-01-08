'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Density = 'default' | 'compact';

interface DensityContextType {
    density: Density;
    setDensity: (density: Density) => void;
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

export function DensityProvider({ children }: { children: React.ReactNode }) {
    const [density, setDensity] = useState<Density>('default');

    useEffect(() => {
        // Load from localStorage if present
        const saved = localStorage.getItem('app-density') as Density;
        if (saved) {
            setDensity(saved);
            document.body.setAttribute('data-density', saved);
        }
    }, []);

    const updateDensity = (newDensity: Density) => {
        setDensity(newDensity);
        localStorage.setItem('app-density', newDensity);
        document.body.setAttribute('data-density', newDensity);
    };

    return (
        <DensityContext.Provider value={{ density, setDensity: updateDensity }}>
            {children}
        </DensityContext.Provider>
    );
}

export function useDensity() {
    const context = useContext(DensityContext);
    if (context === undefined) {
        throw new Error('useDensity must be used within a DensityProvider');
    }
    return context;
}
