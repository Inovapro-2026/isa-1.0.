import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bot, HeadphonesIcon, CheckCircle } from "lucide-react";

const ClientDashboard = () => {
  return (
    <DashboardLayout isAdmin={false}>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Meu Painel</h1>
          <p className="text-muted-foreground">Bem-vindo de volta!</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Status WhatsApp"
            value="Conectado"
            change="Online há 3 dias"
            changeType="positive"
            icon={Bot}
          />
          <MetricCard
            title="Conversas Hoje"
            value="47"
            change="+12 desde ontem"
            changeType="positive"
            icon={MessageSquare}
          />
          <MetricCard
            title="Tickets Abertos"
            value="2"
            change="Aguardando resposta"
            changeType="neutral"
            icon={HeadphonesIcon}
          />
        </div>

        {/* Quick Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Status da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                    <span className="font-medium">ISA está ativa</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Respondendo automaticamente</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sua assistente está funcionando normalmente e respondendo às mensagens dos seus clientes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                Últimas Atividades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { text: "Conversa com cliente finalizada", time: "há 10 min" },
                  { text: "Nova mensagem recebida", time: "há 25 min" },
                  { text: "Ticket #45 atualizado", time: "há 1 hora" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm">{item.text}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
