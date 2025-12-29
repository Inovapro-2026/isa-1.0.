import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Send, User, Bot, Phone, Image, FileText, Mic, MapPin,
  MoreVertical, Star, Archive, Volume2, VolumeX, Settings, Brain,
  CheckCheck, Check, Clock, Smile, Paperclip, Play, Pause,
  Users, ShoppingCart, AlertCircle, CreditCard, Package, Forward
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Contact {
  id: string;
  name: string;
  phone_number: string;
  profile_pic_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online: boolean;
  is_group: boolean;
  is_favorite: boolean;
}

interface Message {
  id: string;
  content: string;
  is_from_me: boolean;
  is_ai_response: boolean;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  media_type: string | null;
  media_url: string | null;
}

interface WhatsAppInstance {
  id: string;
  instance_name: string;
  status: string;
  phone_number: string | null;
}

// Mock data
const mockContacts: Contact[] = [
  { id: "1", name: "João Silva", phone_number: "+55 11 99999-0001", profile_pic_url: null, last_message: "Olá, gostaria de saber mais sobre...", last_message_time: "10:30", unread_count: 2, is_online: true, is_group: false, is_favorite: true },
  { id: "2", name: "Maria Santos", phone_number: "+55 11 99999-0002", profile_pic_url: null, last_message: "Obrigada pelo atendimento!", last_message_time: "09:45", unread_count: 0, is_online: false, is_group: false, is_favorite: false },
  { id: "3", name: "Grupo Vendas", phone_number: "", profile_pic_url: null, last_message: "Pessoal, nova promoção...", last_message_time: "Ontem", unread_count: 5, is_online: false, is_group: true, is_favorite: false },
  { id: "4", name: "Pedro Lima", phone_number: "+55 11 99999-0003", profile_pic_url: null, last_message: "Qual o valor do produto?", last_message_time: "Ontem", unread_count: 1, is_online: true, is_group: false, is_favorite: true },
  { id: "5", name: "Ana Costa", phone_number: "+55 11 99999-0004", profile_pic_url: null, last_message: "Pode me enviar o catálogo?", last_message_time: "Ontem", unread_count: 0, is_online: false, is_group: false, is_favorite: false },
  { id: "6", name: "Carlos Oliveira", phone_number: "+55 11 99999-0005", profile_pic_url: null, last_message: "Fechado! Vou fazer o PIX", last_message_time: "Seg", unread_count: 0, is_online: false, is_group: false, is_favorite: false },
];

const mockMessages: Message[] = [
  { id: "1", content: "Olá, bom dia!", is_from_me: false, is_ai_response: false, timestamp: "10:25", status: "read", media_type: null, media_url: null },
  { id: "2", content: "Olá! Bem-vindo! Sou a ISA, assistente virtual. Como posso ajudar você hoje? 😊", is_from_me: true, is_ai_response: true, timestamp: "10:25", status: "read", media_type: null, media_url: null },
  { id: "3", content: "Gostaria de saber mais sobre os serviços de vocês", is_from_me: false, is_ai_response: false, timestamp: "10:28", status: "read", media_type: null, media_url: null },
  { id: "4", content: "Claro! Oferecemos automação de atendimento via WhatsApp com inteligência artificial. Temos planos a partir de R$99/mês. Quer que eu explique melhor nossos planos?", is_from_me: true, is_ai_response: true, timestamp: "10:28", status: "read", media_type: null, media_url: null },
  { id: "5", content: "Sim, por favor! Qual a diferença entre eles?", is_from_me: false, is_ai_response: false, timestamp: "10:30", status: "read", media_type: null, media_url: null },
];

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const instanceId = searchParams.get('instance');
  
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>(instanceId || "");
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(mockContacts[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "favorites">("all");
  const [isAIActive, setIsAIActive] = useState(true);
  const [sendMode, setSendMode] = useState<"auto" | "manual" | "approve">("auto");
  const [showContextPanel, setShowContextPanel] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInstances();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchInstances = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('whatsapp_instances')
        .select('id, instance_name, status, phone_number')
        .eq('status', 'connected')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInstances(data || []);
      
      if (data && data.length > 0 && !selectedInstance) {
        setSelectedInstance(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching instances:', error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      is_from_me: true,
      is_ai_response: false,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
      media_type: null,
      media_url: null,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate AI response if in auto mode
    if (sendMode === "auto" && isAIActive) {
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "Entendi! Vou verificar isso para você. Aguarde um momento... ✅",
          is_from_me: true,
          is_ai_response: true,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: "sent",
          media_type: null,
          media_url: null,
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "read": return <CheckCheck className="w-4 h-4 text-primary" />;
      case "delivered": return <CheckCheck className="w-4 h-4 text-muted-foreground" />;
      default: return <Check className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone_number.includes(searchTerm);
    const matchesFilter = filter === "all" || 
                         (filter === "unread" && contact.unread_count > 0) ||
                         (filter === "favorites" && contact.is_favorite);
    return matchesSearch && matchesFilter;
  });

  const formatCPF = (value: string) => {
    return value
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-2rem)] flex flex-col p-4 lg:p-6 gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Chat</h1>
            <p className="text-sm text-muted-foreground">Interação direta com clientes</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedInstance} onValueChange={setSelectedInstance}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {instances.map(inst => (
                  <SelectItem key={inst.id} value={inst.id}>
                    {formatCPF(inst.instance_name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={isAIActive ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAIActive(!isAIActive)}
            >
              {isAIActive ? <Bot className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
              {isAIActive ? "IA Ativa" : "IA Pausada"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          {/* Contacts Sidebar */}
          <Card className="glass lg:col-span-1 flex flex-col overflow-hidden">
            <CardHeader className="p-3 border-b border-border space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1 text-xs">Todas</TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1 text-xs">Não lidas</TabsTrigger>
                  <TabsTrigger value="favorites" className="flex-1 text-xs">
                    <Star className="w-3 h-3" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <ScrollArea className="flex-1">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`w-full p-3 text-left border-b border-border transition-colors ${
                    selectedContact?.id === contact.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        {contact.is_group ? (
                          <Users className="w-5 h-5 text-primary" />
                        ) : (
                          <User className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      {contact.is_online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium truncate ${contact.unread_count > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {contact.name}
                        </p>
                        <span className="text-xs text-muted-foreground">{contact.last_message_time}</span>
                      </div>
                      <p className={`text-sm truncate ${contact.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {contact.last_message}
                      </p>
                    </div>
                    {contact.unread_count > 0 && (
                      <Badge className="bg-primary text-primary-foreground h-5 w-5 p-0 justify-center rounded-full text-xs">
                        {contact.unread_count}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="glass lg:col-span-2 flex flex-col overflow-hidden">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <CardHeader className="p-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        {selectedContact.is_online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-background" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{selectedContact.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedContact.is_online ? "Online" : `Visto por último ${selectedContact.last_message_time}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Search className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setShowContextPanel(!showContextPanel)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.is_from_me ? "justify-end" : "justify-start"}`}
                      >
                        {!msg.is_from_me && (
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.is_from_me
                              ? msg.is_ai_response
                                ? "gradient-button text-primary-foreground rounded-tr-sm"
                                : "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-secondary text-secondary-foreground rounded-tl-sm"
                          }`}
                        >
                          {msg.is_ai_response && msg.is_from_me && (
                            <div className="flex items-center gap-1 mb-1 text-xs opacity-80">
                              <Bot className="w-3 h-3" />
                              <span>IA</span>
                            </div>
                          )}
                          <p className="text-sm">{msg.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            msg.is_from_me ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>
                            <span className="text-xs">{msg.timestamp}</span>
                            {msg.is_from_me && getStatusIcon(msg.status)}
                          </div>
                        </div>
                        {msg.is_from_me && !msg.is_ai_response && (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        {msg.is_from_me && msg.is_ai_response && (
                          <div className="w-8 h-8 rounded-full gradient-button flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t border-border space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Modo:</span>
                    <Button
                      variant={sendMode === "auto" ? "default" : "ghost"}
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setSendMode("auto")}
                    >
                      IA Automática
                    </Button>
                    <Button
                      variant={sendMode === "manual" ? "default" : "ghost"}
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setSendMode("manual")}
                    >
                      Manual
                    </Button>
                    <Button
                      variant={sendMode === "approve" ? "default" : "ghost"}
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setSendMode("approve")}
                    >
                      IA + Aprovação
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Image className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Mic className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button variant="hero" size="icon" onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma conversa para começar</p>
                </div>
              </div>
            )}
          </Card>

          {/* Context Panel */}
          {showContextPanel && selectedContact && (
            <Card className="glass lg:col-span-1 flex flex-col overflow-hidden">
              <CardHeader className="p-3 border-b border-border">
                <CardTitle className="text-sm">Contexto</CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase">Informações</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Nome:</span> {selectedContact.name}</p>
                      <p><span className="text-muted-foreground">Telefone:</span> {selectedContact.phone_number}</p>
                      <p><span className="text-muted-foreground">Cadastro:</span> 15/01/2024</p>
                    </div>
                  </div>

                  {/* Last Purchase */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase">Última Compra</h4>
                    <div className="p-2 rounded-lg bg-card border text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="font-medium">Plano Pro</span>
                      </div>
                      <p className="text-muted-foreground text-xs">R$ 199,00 - 10/01/2024</p>
                    </div>
                  </div>

                  {/* Alerts */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase">Alertas</h4>
                    <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        <span className="text-destructive">Pagamento pendente</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase">Ações Rápidas</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        Templates
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <CreditCard className="w-3 h-3 mr-1" />
                        Pagamento
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <Package className="w-3 h-3 mr-1" />
                        Pedido
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <Forward className="w-3 h-3 mr-1" />
                        Encaminhar
                      </Button>
                    </div>
                  </div>

                  {/* AI Controls */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase">Controles IA</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-8 text-xs justify-start"
                        onClick={() => navigate(`/memoria-ia?instance=${selectedInstance}`)}
                      >
                        <Brain className="w-3 h-3 mr-2" />
                        Configurar IA
                      </Button>
                      <Button 
                        variant={isAIActive ? "outline" : "default"} 
                        size="sm" 
                        className="w-full h-8 text-xs justify-start"
                        onClick={() => setIsAIActive(!isAIActive)}
                      >
                        {isAIActive ? <Pause className="w-3 h-3 mr-2" /> : <Play className="w-3 h-3 mr-2" />}
                        {isAIActive ? "Pausar para este contato" : "Retomar IA"}
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
