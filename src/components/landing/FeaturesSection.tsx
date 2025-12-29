import { Card, CardContent } from "@/components/ui/card";
import { Bot, MessageSquare, Shield, Zap, Users, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "IA Avançada",
    description: "Respostas inteligentes e contextuais baseadas em aprendizado contínuo.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integrado",
    description: "Conexão direta com WhatsApp Business sem intermediários.",
  },
  {
    icon: Zap,
    title: "Resposta Instantânea",
    description: "Tempo de resposta inferior a 1 segundo para seus clientes.",
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Dados criptografados e conformidade com LGPD garantida.",
  },
  {
    icon: Users,
    title: "Transição Humana",
    description: "Passagem inteligente para atendente quando necessário.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Detalhados",
    description: "Analytics completo de conversas, conversões e performance.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que escolher a <span className="text-gradient">ISA</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma completa para transformar seu atendimento ao cliente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              variant="gradient"
              className="group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-primary transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
