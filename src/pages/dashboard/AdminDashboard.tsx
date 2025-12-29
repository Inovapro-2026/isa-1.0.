import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, DollarSign, Activity, Clock, CheckCircle } from "lucide-react";

const recentActivity = [
  { id: 1, action: "Novo cliente aprovado", user: "João Silva", time: "há 5 min" },
  { id: 2, action: "WhatsApp reconectado", user: "Sistema", time: "há 15 min" },
  { id: 3, action: "Ticket resolvido #234", user: "Maria Santos", time: "há 1 hora" },
  { id: 4, action: "Nova solicitação de acesso", user: "Pedro Lima", time: "há 2 horas" },
  { id: 5, action: "Relatório mensal gerado", user: "Sistema", time: "há 3 horas" },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout isAdmin>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da plataforma ISA</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Clientes"
            value="1,234"
            change="+12% este mês"
            changeType="positive"
            icon={Users}
          />
          <MetricCard
            title="WhatsApps Conectados"
            value="892"
            change="72% ativos"
            changeType="neutral"
            icon={MessageSquare}
          />
          <MetricCard
            title="Solicitações Pendentes"
            value="23"
            change="-5 desde ontem"
            changeType="positive"
            icon={Clock}
          />
          <MetricCard
            title="Receita Mensal (MRR)"
            value="R$ 45.6K"
            change="+8.2% vs mês anterior"
            changeType="positive"
            icon={DollarSign}
          />
        </div>

        {/* Charts placeholder and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart placeholder */}
          <Card variant="gradient" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Receita por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">Aguardando conexão com o serviço de dados</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card variant="gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                    </div>
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

export default AdminDashboard;
