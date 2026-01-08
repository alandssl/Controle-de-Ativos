// --- Importações ---
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { PermissionsProvider } from '@/providers/permissions-provider';

// --- Componente: Layout do Dashboard ---
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionsProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 pt-6">
            {children}
          </main>
        </div>
      </div>
    </PermissionsProvider>
  );
}
