import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortIconProps {
    column: string;
    sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
}

export function SortIcon({ column, sortConfig }: SortIconProps) {
    if (sortConfig?.key !== column) {
        return <ArrowUpDown className="ml-3 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? (
        <ArrowUp className="ml-3 h-4 w-4" />
    ) : (
        <ArrowDown className="ml-3 h-4 w-4" />
    );
}
