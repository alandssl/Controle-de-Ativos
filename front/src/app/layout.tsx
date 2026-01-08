import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { NotificationProvider } from '@/providers/notification-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Controle de Ativos - PCA',
    description: 'Sistema de controle de ativos de TI',
    icons: {
        icon: '/logo_tecal.png',
    },
};

import { DensityProvider } from '@/providers/density-provider';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <DensityProvider>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                    </DensityProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
