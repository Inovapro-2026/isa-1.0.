import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bot, HeadphonesIcon, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SkeletonCard, SkeletonList } from "@/components/ui/skeleton-card";
import { StatusIndicator } from "@/components/StatusIndicator";

interface WhatsAppInstance {
  id: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  is_ai_active: boolean | null;
  instance_name: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | null;
  created_at: string | null;
}

const ClientDashboard = () => {
  const { profile, user } = useAuth();
  const [whatsappInstance, setWhatsappInstance] = useState<WhatsAppInstance | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchClientData();
    }
  }, [user]);

  const fetchClientData = async () => {
    if (!user) return;

    try {
      // Fetch WhatsApp instance
      const { data: instanceData } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setWhatsappInstance(instanceData);

      // Fetch today's messages count
      if (instanceData) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from('whatsapp_messages')
          .select('id', { count: 'exact' })
          .eq('instance_id', instanceData.id)
          .gte('created_at', today.toISOString());

        setMessageCount(count || 0);
      }

      // Fetch open tickets
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('id, subject, status, created_at')
        .eq('user_id', user.id)
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(5);

      setTickets(ticketsData || []);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWhatsAppStatus = () => {
    if (!whatsappInstance) return { label: 'Não configurado', status: 'offline' as const };
    switch (whatsappInstance.status) {
      case 'connected': return { label: 'Conectado', status: 'online' as const };
      case 'connecting': return { label: 'Conectando...', status: 'connecting' as const };
      default: return { label: 'Desconectado', status: 'offline' as const };
    }
  };

  const whatsappStatus = getWhatsAppStatus();

  return (
    <DashboardLayout isAdmin={false}>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Meu Painel</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {profile?.full_name?.split(' ')[0] || 'Cliente'}!
          </p>
        </div>

        {/* Metrics */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Status WhatsApp"
              value={whatsappStatus.label}
              change={whatsappInstance?.instance_name || 'Aguardando configuração'}
              changeType={whatsappStatus.status === 'online' ? 'positive' : 'neutral'}
              icon={whatsappStatus.status === 'online' ? Wifi : WifiOff}
            />
            <MetricCard
              title="Conversas Hoje"
              value={messageCount.toString()}
              change="Mensagens trocadas"
              changeType="positive"
              icon={MessageSquare}
            />
            <MetricCard
              title="Tickets Abertos"
              value={tickets.length.toString()}
              change={tickets.length > 0 ? "Aguardando resposta" : "Nenhum ticket"}
              changeType="neutral"
              icon={HeadphonesIcon}
            />
          </div>
        )}

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
              {isLoading ? (
                <SkeletonList />
              ) : (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-4 rounded-lg border ${
                    whatsappInstance?.is_ai_active 
                      ? 'bg-accent/10 border-accent/30' 
                      : 'bg-muted/30 border-border'
                  }`}>
                    <div className="flex items-center gap-3">
                      <StatusIndicator 
                        status={whatsappInstance?.is_ai_active ? 'online' : 'offline'}
                        size="md"
                      />
                      <span className="font-medium">
                        {whatsappInstance?.is_ai_active ? 'ISA está ativa' : 'ISA está pausada'}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {whatsappInstance?.is_ai_active 
                        ? 'Respondendo automaticamente' 
                        : 'Aguardando ativação'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {whatsappInstance?.is_ai_active 
                      ? 'Sua assistente está funcionando normalmente e respondendo às mensagens dos seus clientes.'
                      : 'Ative a ISA para começar a responder automaticamente às mensagens.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                Meus Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonList />
              ) : tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">{ticket.subject}</span>
                        <span className="text-xs text-muted-foreground">
                          {ticket.status === 'open' ? 'Aberto' : 'Em andamento'}
                        </span>
                      </div>
                      <StatusIndicator 
                        status={ticket.status === 'open' ? 'warning' : 'connecting'} 
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>Nenhum ticket aberto</p>
                  <p className="text-sm">Tudo em ordem!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
