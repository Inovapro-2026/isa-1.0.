import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { HeadphonesIcon, Send, Plus, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

interface Ticket {
  id: number;
  titulo: string;
  status: "open" | "in_progress" | "resolved";
  ultimaAtualizacao: string;
}

const myTickets: Ticket[] = [
  { id: 45, titulo: "Dúvida sobre integração", status: "in_progress", ultimaAtualizacao: "1 hora atrás" },
  { id: 42, titulo: "Problema com QR Code", status: "resolved", ultimaAtualizacao: "3 dias atrás" },
];

const ClientSupport = () => {
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleCreateTicket = () => {
    // Simula criação
    setNewTicketOpen(false);
    setTitulo("");
    setDescricao("");
  };

  return (
    <DashboardLayout isAdmin={false}>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meu Suporte</h1>
            <p className="text-muted-foreground">Seus tickets de atendimento</p>
          </div>
          <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4" />
                Novo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Abrir Novo Ticket</DialogTitle>
                <DialogDescription>
                  Descreva seu problema ou dúvida para nossa equipe
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assunto</label>
                  <Input
                    placeholder="Resumo do problema"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    placeholder="Descreva detalhadamente seu problema..."
                    className="min-h-32"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewTicketOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="hero" onClick={handleCreateTicket}>
                  Enviar Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {myTickets.map((ticket) => (
            <Card key={ticket.id} variant="gradient" className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">#{ticket.id}</span>
                        <Badge 
                          variant={ticket.status === "resolved" ? "default" : "outline"}
                          className={ticket.status === "resolved" ? "bg-accent text-accent-foreground" : ""}
                        >
                          {ticket.status === "open" && "Aberto"}
                          {ticket.status === "in_progress" && "Em Andamento"}
                          {ticket.status === "resolved" && "Resolvido"}
                        </Badge>
                      </div>
                      <p className="font-medium mt-1">{ticket.titulo}</p>
                      <p className="text-sm text-muted-foreground">Atualizado {ticket.ultimaAtualizacao}</p>
                    </div>
                  </div>
                  <Button variant="outline">Ver Detalhes</Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {myTickets.length === 0 && (
            <Card variant="gradient">
              <CardContent className="p-12 text-center">
                <HeadphonesIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Você não tem tickets abertos</p>
                <p className="text-sm text-muted-foreground mt-1">Clique em "Novo Ticket" para abrir um chamado</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientSupport;
