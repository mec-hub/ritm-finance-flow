
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  BarChart3, 
  FileText, 
  Settings,
  ArrowRight,
  CheckCircle,
  Music,
  Zap
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: DollarSign,
      title: "Gestão Financeira",
      description: "Controle suas receitas, despesas e acompanhe o fluxo de caixa em tempo real."
    },
    {
      icon: Calendar,
      title: "Gestão de Eventos",
      description: "Organize seus shows, festas e eventos com planejamento completo."
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Mantenha um relacionamento próximo com seus clientes e histórico completo."
    },
    {
      icon: BarChart3,
      title: "Análises Avançadas",
      description: "Relatórios detalhados e insights para tomar melhores decisões."
    }
  ];

  const benefits = [
    "Interface intuitiva e fácil de usar",
    "Controle total das suas finanças",
    "Gestão profissional de eventos",
    "Relatórios personalizados",
    "Acesso em qualquer dispositivo",
    "Dados seguros e protegidos"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">DJ Davizão Financial</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button>Começar Agora</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-4 w-4 mr-1" />
            Sistema de Gestão Musical
          </Badge>
          
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Gerencie seu negócio musical com 
            <span className="text-blue-600"> excelência</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A plataforma completa para DJs e profissionais da música organizarem 
            finanças, eventos e clientes em um só lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Criar Conta Grátis
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Já tenho uma conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tudo que você precisa em uma plataforma
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ferramentas profissionais para levar seu negócio musical ao próximo nível
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Por que escolher o DJ Davizão Financial?
              </h2>
              <p className="text-lg text-gray-600">
                Desenvolvido especialmente para profissionais da música
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Comece hoje mesmo!</h3>
                <p className="mb-6 opacity-90">
                  Crie sua conta gratuita e transforme a gestão do seu negócio musical.
                </p>
                <Link to="/auth">
                  <Button variant="secondary" size="lg" className="w-full">
                    Criar Conta Grátis
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Music className="h-8 w-8" />
              <span className="text-2xl font-bold">DJ Davizão Financial</span>
            </div>
            <p className="text-gray-400 mb-6">
              A solução completa para gestão de negócios musicais
            </p>
            <div className="flex justify-center space-x-6">
              <Link to="/auth" className="text-gray-400 hover:text-white transition-colors">
                Entrar
              </Link>
              <Link to="/auth" className="text-gray-400 hover:text-white transition-colors">
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
