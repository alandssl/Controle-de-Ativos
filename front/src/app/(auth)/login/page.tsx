'use client'; // Indica que este componente deve ser renderizado no lado do cliente

import { useState } from 'react'; // Importa o hook useState do React para gerenciamento de estado local
import { useRouter } from 'next/navigation'; // Importa o hook useRouter do Next.js para navegação
import { Button } from '@/components/ui/button'; // Importa o componente de botão personalizado
import { Input } from '@/components/ui/input'; // Importa o componente de entrada (input) personalizado
import { Label } from '@/components/ui/label'; // Importa o componente de rótulo (label) personalizado
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Importa componentes de cartão para layout
import { Lock, User } from 'lucide-react'; // Importa ícones de cadeado e usuário da biblioteca Lucide React

import Image from 'next/image'; // Importa o componente Image do Next.js para otimização de imagens

export default function LoginPage() { // Componente funcional da página de login
    const [email, setEmail] = useState(''); // Estado para armazenar o email digitado
    const [password, setPassword] = useState(''); // Estado para armazenar a senha digitada
    const [isLoading, setIsLoading] = useState(false); // Estado para controlar o carregamento durante a submissão
    const router = useRouter(); // Instância do roteador para redirecionamento

    const handleLogin = async (e: React.FormEvent) => { // Função assíncrona para lidar com o envio do formulário
        e.preventDefault(); // Previne o comportamento padrão de recarregar a página
        setIsLoading(true); // Define o estado de carregamento como verdadeiro

        // Simula chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguarda 1 segundo simulando latência de rede

        // Lógica simples de verificação (mock)
        if (email === 'admin@pca.com' || email === 'user@pca.com') { // Verifica se o email corresponde a usuários de teste
            // Em um aplicativo real, definiria cookies/tokens aqui
            const user = {
                email,
                role: email.startsWith('admin') ? 'admin' : 'user',
                // Mock linkage to collaborator Vitor Lemos for demo
                name: email === 'admin@pca.com' ? 'Vitor Lemos' : 'Usuário Padrão'
            };
            localStorage.setItem('user', JSON.stringify(user)); // Salva info do usuário no localStorage
            router.push('/'); // Redireciona para a página inicial
        } else { // Se as credenciais não forem válidas
            alert('Credenciais inválidas. Tente admin@pca.com'); // Exibe um alerta para o usuário
        }

        setIsLoading(false); // Define o estado de carregamento como falso após o processo
    };

    return ( // Renderização do componente
        <div className="min-h-screen flex items-center justify-center bg-muted/20"> {/* Container principal centralizado */}
            <Card className="w-full max-w-md"> {/* Cartão de login com largura máxima definida */}
                <CardHeader className="space-y-1"> {/* Cabeçalho do cartão com espaçamento */}
                    <div className="flex justify-center mb-4"> {/* Container para o logotipo */}
                        <Image // Componente de imagem otimizado
                            src="/logo_tecal.png" // Caminho da imagem do logo
                            alt="Tecal Engenharia" // Texto alternativo da imagem
                            width={180} // Largura da imagem
                            height={60} // Altura da imagem
                            className="object-contain" // Estilo para manter a proporção da imagem
                            priority // Carrega a imagem com prioridade
                        />
                    </div>
                    <CardDescription className="text-center"> {/* Descrição do cartão centralizada */}
                        Entre com seu email e senha para acessar
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}> {/* Formulário de login */}
                    <CardContent className="space-y-4"> {/* Conteúdo do cartão com espaçamento vertical */}
                        <div className="space-y-2"> {/* Grupo de campo de email */}
                            <Label htmlFor="email">Email</Label> {/* Rótulo para o campo de email */}
                            <div className="relative"> {/* Container relativo para posicionar o ícone */}
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /> {/* Ícone de usuário posicionado */}
                                <Input // Campo de entrada de email
                                    id="email" // ID do campo
                                    type="email" // Tipo email
                                    placeholder="admin@pca.com" // Placeholder de exemplo
                                    className="pl-9" // Padding esquerdo para acomodar o ícone
                                    value={email} // Valor do estado email
                                    onChange={(e) => setEmail(e.target.value)} // Atualiza o estado ao digitar
                                    required // Campo obrigatório
                                />
                            </div>
                        </div>
                        <div className="space-y-2"> {/* Grupo de campo de senha */}
                            <Label htmlFor="password">Senha</Label> {/* Rótulo para o campo de senha */}
                            <div className="relative"> {/* Container relativo para posicionar o ícone */}
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /> {/* Ícone de cadeado posicionado */}
                                <Input // Campo de entrada de senha
                                    id="password" // ID do campo
                                    type="password" // Tipo senha
                                    className="pl-9" // Padding esquerdo para acomodar o ícone
                                    value={password} // Valor do estado senha
                                    onChange={(e) => setPassword(e.target.value)} // Atualiza o estado ao digitar
                                    required // Campo obrigatório
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter> {/* Rodapé do cartão */}
                        <Button className="w-full" type="submit" disabled={isLoading}> {/* Botão de envio (ocupando toda largura) */}
                            {isLoading ? 'Entrando...' : 'Entrar'} {/* Texto do botão dependendo do estado de carregamento */}
                        </Button>
                    </CardFooter>
                </form>
                <div className="px-8 pb-8 text-center text-xs text-muted-foreground"> {/* Seção de credenciais de demonstração */}
                    <p>Demo Credentials:</p>
                    <p>Admin: admin@pca.com / any</p>
                    <p>User: user@pca.com / any</p>
                </div>
            </Card>
        </div>
    );
}

