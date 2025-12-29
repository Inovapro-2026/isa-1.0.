import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Wifi, WifiOff, RefreshCw, Pause, Play } from "lucide-react";

type ConnectionStatus = "disconnected" | "connecting" | "connected";

const ClientWhatsApp = () => {
  const [status, setStatus] = useState<ConnectionStatus>("connected");
  const [isPaused, setIsPaused] = useState(false);

  return (
    <DashboardLayout isAdmin={false}>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Meu WhatsApp</h1>
          <p className="text-muted-foreground">Status da sua conexão com a ISA</p>
        </div>

        {/* Status Card */}
        <Card variant="gradient" className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-primary" />
              Status da Conexão
            </CardTitle>
            <CardDescription>
              {status === "connected" ? "Seu WhatsApp está conectado" : "WhatsApp desconectado"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status indicator */}
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${
              status === "connected" 
                ? "bg-accent/10 border-accent/30" 
                : "bg-destructive/10 border-destructive/30"
            }`}>
              {status === "connected" ? (
                <Wifi className="w-8 h-8 text-accent" />
              ) : (
                <WifiOff className="w-8 h-8 text-destructive" />
              )}
              <div>
                <p className="font-semibold text-lg">
                  {status === "connected" ? "Conectado" : "Desconectado"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {status === "connected" && (isPaused ? "IA pausada" : "IA respondendo automaticamente")}
                  {status === "disconnected" && "Entre em contato com o suporte"}
                </p>
              </div>
            </div>

            {/* Stats */}
            {status === "connected" && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold text-primary">47</p>
                  <p className="text-xs text-muted-foreground">Conversas hoje</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold text-accent">1.2K</p>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-xs text-muted-foreground">Satisfação</p>
                </div>
              </div>
            )}

            {/* Actions */}
            {status === "connected" && (
              <div className="flex gap-3">
                <Button 
                  variant={isPaused ? "accent" : "outline"} 
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? "Retomar IA" : "Pausar IA"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientWhatsApp;
