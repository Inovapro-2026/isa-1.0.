import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, QrCode, Wifi, WifiOff, RefreshCw, Pause, Play, Trash2, Plus, 
  MessageSquare, Brain, Clock, Users, CheckCircle2, AlertTriangle, XCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface WhatsAppInstance {
  id: string;
  cpf: string;
  phone_number: string | null;
  status: ConnectionStatus;
  is_ai_active: boolean;
  last_connected_at: string | null;
  created_at: string;
  instance_name: string;
  messages_today?: number;
  active_contacts?: number;
  response_rate?: number;
}

const formatCPF = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length !== 11) return false;
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(numbers[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(numbers[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(numbers[10]);
};

const ClientWhatsApp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewConnectionModal, setShowNewConnectionModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [newCpf, setNewCpf] = useState("");
  const [cpfError, setCpfError] = useState("");
  const [qrCountdown, setQrCountdown] = useState(60);
  const [currentInstance, setCurrentInstance] = useState<WhatsAppInstance | null>(null);

  useEffect(() => {
    fetchInstances();
  }, [user]);

  useEffect(() => {
    if (showQRModal && qrCountdown > 0) {
      const timer = setTimeout(() => setQrCountdown(qrCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showQRModal, qrCountdown]);

  const fetchInstances = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedInstances: WhatsAppInstance[] = (data || []).map(inst => ({
        id: inst.id,
        cpf: inst.instance_name,
        phone_number: inst.phone_number,
        status: inst.status as ConnectionStatus || 'disconnected',
        is_ai_active: inst.is_ai_active ?? true,
        last_connected_at: inst.last_connected_at,
        created_at: inst.created_at || new Date().toISOString(),
        instance_name: inst.instance_name,
        messages_today: Math.floor(Math.random() * 100) + 20,
        active_contacts: Math.floor(Math.random() * 50) + 5,
        response_rate: Math.floor(Math.random() * 20) + 80,
      }));

      setInstances(mappedInstances);
    } catch (error) {
      console.error('Error fetching instances:', error);
      toast.error("Erro ao carregar instâncias");
    } finally {
      setLoading(false);
    }
  };

  const handleCpfChange = (value: string) => {
    const formatted = formatCPF(value);
    setNewCpf(formatted);
    
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      if (!validateCPF(numbers)) {
        setCpfError("CPF inválido");
      } else {
        setCpfError("");
      }
    } else {
      setCpfError("");
    }
  };

  const handleCreateConnection = async () => {
    const cpfNumbers = newCpf.replace(/\D/g, '');
    if (!validateCPF(cpfNumbers)) {
      setCpfError("CPF inválido");
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('whatsapp_instances')
        .select('id')
        .eq('instance_name', cpfNumbers)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existing) {
        toast.error("Já existe uma conexão com este CPF");
        return;
      }

      const { data, error } = await supabase
        .from('whatsapp_instances')
        .insert({
          user_id: user?.id,
          instance_name: cpfNumbers,
          status: 'connecting',
          is_ai_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newInstance: WhatsAppInstance = {
        id: data.id,
        cpf: cpfNumbers,
        phone_number: null,
        status: 'connecting',
        is_ai_active: true,
        last_connected_at: null,
        created_at: data.created_at,
        instance_name: cpfNumbers,
        messages_today: 0,
        active_contacts: 0,
        response_rate: 0,
      };

      setCurrentInstance(newInstance);
      setShowNewConnectionModal(false);
      setShowQRModal(true);
      setQrCountdown(60);
      setNewCpf("");

      setTimeout(async () => {
        await supabase
          .from('whatsapp_instances')
          .update({ 
            status: 'connected',
            last_connected_at: new Date().toISOString(),
            phone_number: '+55 11 9' + Math.floor(Math.random() * 90000000 + 10000000)
          })
          .eq('id', data.id);
        
        setShowQRModal(false);
        toast.success("WhatsApp conectado com sucesso!");
        fetchInstances();
      }, 5000);

    } catch (error) {
      console.error('Error creating connection:', error);
      toast.error("Erro ao criar conexão");
    }
  };

  const handleToggleAI = async (instance: WhatsAppInstance) => {
    try {
      await supabase
        .from('whatsapp_instances')
        .update({ is_ai_active: !instance.is_ai_active })
        .eq('id', instance.id);

      toast.success(instance.is_ai_active ? "IA pausada" : "IA retomada");
      fetchInstances();
    } catch (error) {
      console.error('Error toggling AI:', error);
      toast.error("Erro ao alterar IA");
    }
  };

  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-5 h-5 text-accent" />;
      case 'connecting': return <RefreshCw className="w-5 h-5 text-primary animate-spin" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default: return <XCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected': return 'bg-accent/20 text-accent border-accent/30';
      case 'connecting': return 'bg-primary/20 text-primary border-primary/30';
      case 'error': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const stats = {
    connected: instances.filter(i => i.status === 'connected').length,
    total: instances.length,
    messagesTotal: instances.reduce((acc, i) => acc + (i.messages_today || 0), 0),
  };

  return (
    <DashboardLayout isAdmin={false}>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meu WhatsApp</h1>
            <p className="text-muted-foreground">Gerencie suas conexões WhatsApp</p>
          </div>
          <Button variant="hero" onClick={() => setShowNewConnectionModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Conexão
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Wifi className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.connected}/{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Conectadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.messagesTotal}</p>
                  <p className="text-xs text-muted-foreground">Mensagens hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Users className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {instances.reduce((acc, i) => acc + (i.active_contacts || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Contatos ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connection Cards */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <Card key={i} className="glass animate-pulse">
                <CardContent className="p-6 h-48" />
              </Card>
            ))}
          </div>
        ) : instances.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-12 text-center">
              <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma conexão encontrada</h3>
              <p className="text-muted-foreground mb-6">
                Clique em 'Nova Conexão' para começar
              </p>
              <Button variant="hero" onClick={() => setShowNewConnectionModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Conexão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {instances.map((instance) => (
              <Card key={instance.id} className="glass hover:border-primary/30 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl gradient-button flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-foreground">
                          {instance.cpf.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{formatCPF(instance.cpf)}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {instance.phone_number || 'Aguardando conexão'}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(instance.status)}>
                      {getStatusIcon(instance.status)}
                      <span className="ml-1 capitalize">{instance.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border">
                    <div className="text-center">
                      <p className="text-lg font-semibold">{instance.messages_today}</p>
                      <p className="text-xs text-muted-foreground">Msgs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{instance.active_contacts}</p>
                      <p className="text-xs text-muted-foreground">Contatos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{instance.response_rate}%</p>
                      <p className="text-xs text-muted-foreground">Taxa</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {instance.status === 'connected' && (
                      <Button
                        variant={instance.is_ai_active ? 'outline' : 'accent'}
                        size="sm"
                        onClick={() => handleToggleAI(instance)}
                      >
                        {instance.is_ai_active ? (
                          <><Pause className="w-4 h-4 mr-1" /> Pausar IA</>
                        ) : (
                          <><Play className="w-4 h-4 mr-1" /> Retomar IA</>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/client/chat')}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/client/memoria-ia')}
                    >
                      <Brain className="w-4 h-4 mr-1" />
                      Memória IA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* New Connection Modal */}
        <Dialog open={showNewConnectionModal} onOpenChange={setShowNewConnectionModal}>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Nova Conexão WhatsApp
              </DialogTitle>
              <DialogDescription>
                Informe o CPF para criar uma nova instância do WhatsApp
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">CPF</label>
                <Input
                  placeholder="000.000.000-00"
                  value={newCpf}
                  onChange={(e) => handleCpfChange(e.target.value)}
                  maxLength={14}
                  className={cpfError ? 'border-destructive' : ''}
                />
                {cpfError && <p className="text-sm text-destructive">{cpfError}</p>}
                {newCpf.replace(/\D/g, '').length === 11 && !cpfError && (
                  <p className="text-sm text-accent">✓ CPF válido</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewConnectionModal(false)}>
                Cancelar
              </Button>
              <Button 
                variant="hero" 
                onClick={handleCreateConnection}
                disabled={!newCpf || !!cpfError || newCpf.replace(/\D/g, '').length !== 11}
              >
                Continuar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR Code Modal */}
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
          <DialogContent className="glass max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                Escaneie o QR Code
              </DialogTitle>
              <DialogDescription>
                Abra o WhatsApp no celular, vá em Dispositivos Conectados e escaneie o código
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-8 space-y-6">
              <div className="w-64 h-64 bg-card border border-border rounded-2xl flex items-center justify-center">
                <QrCode className="w-48 h-48 text-primary animate-pulse-glow" />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Tempo restante: <span className="text-primary font-bold">{qrCountdown}s</span>
                </p>
                {qrCountdown === 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setQrCountdown(60)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerar QR Code
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ClientWhatsApp;
