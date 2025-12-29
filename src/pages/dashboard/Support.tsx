import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeadphonesIcon, Send, Search, Clock, CheckCircle2 } from "lucide-react";

interface Ticket {
  id: number;
  titulo: string;
  cliente: string;
  status: "open" | "in_progress" | "resolved";
  prioridade: "low" | "medium" | "high";
  ultimaAtualizacao: string;
}

const mockTickets: Ticket[] = [
  { id: 234, titulo: "Problema na conexão do WhatsApp", cliente: "João Silva", status: "open", prioridade: "high", ultimaAtualizacao: "10 min atrás" },
  { id: 233, titulo: "Dúvida sobre configuração da IA", cliente: "Maria Santos", status: "in_progress", prioridade: "medium", ultimaAtualizacao: "1 hora atrás" },
  { id: 232, titulo: "Alteração de plano", cliente: "Pedro Lima", status: "open", prioridade: "low", ultimaAtualizacao: "2 horas atrás" },
  { id: 231, titulo: "Erro ao enviar mensagens", cliente: "Ana Costa", status: "resolved", prioridade: "high", ultimaAtualizacao: "Ontem" },
];

const mockMessages = [
  { id: 1, sender: "client", text: "Olá, estou com problemas para conectar meu WhatsApp. O QR Code não aparece.", time: "10:15" },
  { id: 2, sender: "support", text: "Olá João! Entendi o problema. Você já tentou limpar a sessão e reconectar?", time: "10:18" },
  { id: 3, sender: "client", text: "Sim, tentei mas continua sem funcionar", time: "10:20" },
];

const Support = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket>(mockTickets[0]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      setMessage("");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-yellow-500/20 text-yellow-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return <CheckCircle2 className="w-4 h-4 text-accent" />;
      case "in_progress": return <Clock className="w-4 h-4 text-primary" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 h-[calc(100vh-2rem)]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Suporte</h1>
          <p className="text-muted-foreground">Sistema de tickets para atendimento interno</p>
        </div>

        {/* Support Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100%-5rem)]">
          {/* Tickets List */}
          <Card variant="gradient" className="lg:col-span-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar ticket..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {mockTickets.filter(t => 
                t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.cliente.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full p-4 text-left border-b border-border transition-colors ${
                    selectedTicket.id === ticket.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-muted-foreground">#{ticket.id}</span>
                    <Badge className={getPriorityColor(ticket.prioridade)} variant="secondary">
                      {ticket.prioridade === "high" ? "Alta" : ticket.prioridade === "medium" ? "Média" : "Baixa"}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm mb-1 line-clamp-1">{ticket.titulo}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{ticket.cliente}</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(ticket.status)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat Area */}
          <Card variant="gradient" className="lg:col-span-2 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <HeadphonesIcon className="w-5 h-5 text-primary" />
                    <span className="font-medium">Ticket #{selectedTicket.id}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTicket.titulo}</p>
                </div>
                <Badge 
                  variant={selectedTicket.status === "resolved" ? "default" : "outline"}
                  className={selectedTicket.status === "resolved" ? "bg-accent text-accent-foreground" : ""}
                >
                  {selectedTicket.status === "open" && "Aberto"}
                  {selectedTicket.status === "in_progress" && "Em Andamento"}
                  {selectedTicket.status === "resolved" && "Resolvido"}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.sender === "client" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.sender === "client"
                        ? "bg-secondary text-secondary-foreground rounded-tl-sm"
                        : "gradient-button text-primary-foreground rounded-tr-sm"
                    }`}
                  >
                    <p className="text-xs font-medium mb-1">
                      {msg.sender === "client" ? selectedTicket.cliente : "Suporte ISA"}
                    </p>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === "client" ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            {selectedTicket.status !== "resolved" && (
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua resposta..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <Button variant="hero" size="icon" onClick={handleSend}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Support;
