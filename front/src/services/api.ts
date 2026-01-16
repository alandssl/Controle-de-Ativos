const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api';

export const api = {
    get: async (endpoint: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, { cache: 'no-store' });
            if (!res.ok) {
                // Tentar analisar a mensagem de erro do corpo, se possível
                try {
                    const errBody = await res.json();
                    throw new Error(errBody.message || `API Error: ${res.status}`);
                } catch (e) {
                    throw new Error(`API Error: ${res.status}`);
                }
            }
            return res.json();
        } catch (error) {
            console.error(`Fetch failed for ${endpoint}:`, error);
            throw error;
        }
    },
    post: async (endpoint: string, data: any) => {
        try {
            const isFormData = data instanceof FormData;
            const headers: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };

            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: headers as any,
                body: isFormData ? data : JSON.stringify(data),
            });
            if (!res.ok) {
                try {
                    const errBody = await res.json();
                    throw new Error(errBody.message || `API Error: ${res.status}`);
                } catch (e) {
                    throw new Error(`API Error: ${res.status}`);
                }
            }
            // Retorna text se não for JSON, ou tenta parsear
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        } catch (error) {
            console.error(`Post failed for ${endpoint}:`, error);
            throw error;
        }
    },
    put: async (endpoint: string, data: any) => {
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                try {
                    const errBody = await res.json();
                    throw new Error(errBody.message || `API Error: ${res.status}`);
                } catch (e) {
                    throw new Error(`API Error: ${res.status}`);
                }
            }
            return res.json();
        } catch (error) {
            console.error(`Put failed for ${endpoint}:`, error);
            throw error;
        }
    },
    delete: async (endpoint: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                try {
                    const errBody = await res.json();
                    throw new Error(errBody.message || `API Error: ${res.status}`);
                } catch (e) {
                    throw new Error(`API Error: ${res.status}`);
                }
            }
            return true;
        } catch (error) {
            console.error(`Delete failed for ${endpoint}:`, error);
            throw error;
        }
    }
};

export const ENDPOINTS = {
    ASSETS: '/equipamentos',
    MOVEMENTS: '/movimentos',
    EMPLOYEES: '/colaboradores',
    SCRAP: '/pecas',
    INVOICES: '/notas-fiscais',
    CATEGORIES: '/categorias',
    LOCATIONS: '/localizacoes',
    STATUS: '/equipamentos/status',
    TIPO_ESTADOS: '/equipamentos/tipo-estados',
    SUPPLIER_NAMES: '/notas-fiscais/fornecedores',
    INVOICE_NUMBERS: '/notas-fiscais/numeros',
    SCRAP_RECORD: '/sucata',
};
