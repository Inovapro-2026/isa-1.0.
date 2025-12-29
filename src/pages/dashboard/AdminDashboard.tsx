import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, DollarSign, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SkeletonCard, SkeletonList } from "@/components/ui/skeleton-card";
import { useAuth } from "@/hooks/useAuth";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  pendingRequests: number;
  monthlyRevenue: number;
  clientGrowth: string;
}

interface SystemLog {
  id: string;
  action: string;
  created_at: string;
  details: unknown;
}

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch clients count
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, is_active', { count: 'exact' });

      // Fetch pending requests count
      const { count: pendingCount } = await supabase
        .from('account_requests')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      // Fetch approved requests this month for MRR calculation
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: approvedThisMonth } = await supabase
        .from('account_requests')
        .select('id', { count: 'exact' })
        .eq('status', 'approved')
        .gte('reviewed_at', startOfMonth.toISOString());

      // Fetch recent activity from system_logs
      const { data: logsData } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const totalClients = clientsData?.length || 0;
      const activeClients = clientsData?.filter(c => c.is_active)?.length || 0;
      
      // Calculate MRR: R$97 per active client
      const mrr = activeClients * 97;

      setMetrics({
        totalClients,
        activeClients,
        pendingRequests: pendingCount || 0,
        monthlyRevenue: mrr,
        clientGrowth: `+${approvedThisMonth || 0} este mês`,
      });

      setRecentActivity(logsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock chart data - will be replaced with real data
  const chartData = [
    { month: 'Set', value: 2400 },
    { month: 'Out', value: 3600 },
    { month: 'Nov', value: 4200 },
    { month: 'Dez', value: metrics?.monthlyRevenue || 4850 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffMins < 1440) return `há ${Math.floor(diffMins / 60)} horas`;
    return `há ${Math.floor(diffMins / 1440)} dias`;
  };

  return (
    <DashboardLayout isAdmin>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo de volta, {profile?.full_name?.split(' ')[0] || 'Admin'}!
            </p>
          </div>
        </div>

        {/* Metrics */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Clientes"
              value={metrics?.totalClients?.toString() || '0'}
              change={metrics?.clientGrowth || '+0 este mês'}
              changeType="positive"
              icon={Users}
            />
            <MetricCard
              title="Clientes Ativos"
              value={metrics?.activeClients?.toString() || '0'}
              change={`${metrics?.totalClients ? Math.round((metrics.activeClients / metrics.totalClients) * 100) : 0}% ativos`}
              changeType="neutral"
              icon={MessageSquare}
            />
            <MetricCard
              title="Solicitações Pendentes"
              value={metrics?.pendingRequests?.toString() || '0'}
              change="Aguardando aprovação"
              changeType={metrics?.pendingRequests ? "neutral" : "positive"}
              icon={Clock}
            />
            <MetricCard
              title="Receita Mensal (MRR)"
              value={formatCurrency(metrics?.monthlyRevenue || 0)}
              change="R$ 97 por cliente"
              changeType="positive"
              icon={DollarSign}
            />
          </div>
        )}

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card variant="gradient" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Receita por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `R$${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Receita']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
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
              {isLoading ? (
                <SkeletonList />
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma atividade recente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
