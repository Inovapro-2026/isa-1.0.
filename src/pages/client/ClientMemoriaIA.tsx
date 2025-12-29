import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Save, RotateCcw, Send, Bot, 
  Building2, Clock, Package, FileText, MessageSquare,
  Zap, Settings2, GraduationCap, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface AIConfig {
  id: string;
  ai_name: string;
  welcome_message: string;
  tone: string;
  formality_level: number;
  allowed_emojis: string[];
  business_hours: {
    start: string;
    end: string;
    days: number[];
  };
  knowledge_base: any;
  faqs: any[];
  triggers: any[];
}

const defaultKnowledge = {
  company: {
    name: "",
    segment: "",
    products: "",
    values: "",
    mission: "",
  },
  contact: {
    hours: "",
    phones: "",
    address: "",
    email: "",
  },
  products: "",
  policies: "",
  keywords: "",
  sensitive: "",
};

const ClientMemoriaIA = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");

  const [knowledge, setKnowledge] = useState(defaultKnowledge);

  const [behavior, setBehavior] = useState({
    responseSpeed: "immediate",
    confirmReceipt: true,
    emojiLevel: "moderate",
    forwardToHuman: ["atendente", "humano", "pessoa"],
  });

  const [learning, setLearning] = useState({
    enabled: true,
    learnNames: true,
    learnPreferences: true,
    learnPatterns: true,
    forgetAfter: "90",
  });

  const [commands, setCommands] = useState({
    pauseWords: "pare, pausa, humano",
    resumeWords: "continue, volte, ia",
    summaryCommand: "resumo hoje",
    statsCommand: "estatísticas",
  });

  useEffect(() => {
    if (user) fetchConfig();
  }, [user]);

  const fetchConfig = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('ai_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data as any);
        if (data.knowledge_base && typeof data.knowledge_base === 'object') {
          setKnowledge({ ...defaultKnowledge, ...data.knowledge_base });
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const updateData = {
        ai_name: config?.ai_name || "Assistente IA",
        welcome_message: config?.welcome_message || "Olá! Como posso ajudar?",
        tone: config?.tone || "friendly",
        formality_level: config?.formality_level || 5,
        knowledge_base: knowledge,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('ai_configs')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = () => {
    if (!testMessage) return;
    setTestResponse("Olá! Baseado nas informações configuradas, eu responderia: '" + 
      (config?.welcome_message || "Como posso ajudar você hoje?") + 
      "'. A resposta foi gerada considerando o tom " + 
      (config?.tone || "friendly") + " e nível de formalidade " + 
      (config?.formality_level || 5) + "/10.");
  };

  const handleReset = () => {
    setKnowledge(defaultKnowledge);
    toast.success("Configurações restauradas para o padrão");
  };

  const getMemoryStatus = () => {
    const filled = Object.values(knowledge.company).filter(Boolean).length +
                   Object.values(knowledge.contact).filter(Boolean).length +
                   (knowledge.products ? 1 : 0) +
                   (knowledge.policies ? 1 : 0);
    const total = 10;
    const percentage = Math.round((filled / total) * 100);
    
    if (percentage >= 80) return { text: "Memória otimizada", color: "text-accent" };
    if (percentage >= 50) return { text: "Memória parcial", color: "text-primary" };
    return { text: "Necessita configuração", color: "text-destructive" };
  };

  const memoryStatus = getMemoryStatus();

  return (
    <DashboardLayout isAdmin={false}>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              Memória de IA
            </h1>
            <p className="text-muted-foreground">Personalize o comportamento e conhecimento da sua IA</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-card border">
              <Sparkles className={`w-4 h-4 ${memoryStatus.color}`} />
              <span className={`text-sm ${memoryStatus.color}`}>{memoryStatus.text}</span>
            </div>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar
            </Button>
            <Button variant="hero" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="glass w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="identity" className="gap-2">
              <Bot className="w-4 h-4" />
              Identidade
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2">
              <Building2 className="w-4 h-4" />
              Conhecimento
            </TabsTrigger>
            <TabsTrigger value="behavior" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Comportamento
            </TabsTrigger>
            <TabsTrigger value="learning" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Aprendizado
            </TabsTrigger>
            <TabsTrigger value="commands" className="gap-2">
              <Zap className="w-4 h-4" />
              Comandos
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Testar
            </TabsTrigger>
          </TabsList>

          {/* Identity Tab */}
          <TabsContent value="identity" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Perfil da IA</CardTitle>
                  <CardDescription>Como a IA se apresenta aos clientes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome da IA</Label>
                    <Input
                      value={config?.ai_name || ""}
                      onChange={(e) => setConfig(prev => prev ? {...prev, ai_name: e.target.value} : null)}
                      placeholder="Ex: Assistente Virtual, ISA, Bia..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Saudação Padrão</Label>
                    <Textarea
                      value={config?.welcome_message || ""}
                      onChange={(e) => setConfig(prev => prev ? {...prev, welcome_message: e.target.value} : null)}
                      placeholder="Mensagem inicial automática..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Tom de Voz</CardTitle>
                  <CardDescription>Estilo de comunicação da IA</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Estilo</Label>
                    <Select 
                      value={config?.tone || "friendly"} 
                      onValueChange={(v) => setConfig(prev => prev ? {...prev, tone: v} : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="friendly">Amigável</SelectItem>
                        <SelectItem value="technical">Técnico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Nível de Formalidade</Label>
                      <span className="text-sm text-muted-foreground">
                        {config?.formality_level || 5}/10
                      </span>
                    </div>
                    <Slider
                      value={[config?.formality_level || 5]}
                      onValueChange={([v]) => setConfig(prev => prev ? {...prev, formality_level: v} : null)}
                      max={10}
                      min={1}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Knowledge Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Empresa</Label>
                    <Input
                      value={knowledge.company.name}
                      onChange={(e) => setKnowledge(prev => ({
                        ...prev,
                        company: { ...prev.company, name: e.target.value }
                      }))}
                      placeholder="Nome completo da empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Segmento</Label>
                    <Input
                      value={knowledge.company.segment}
                      onChange={(e) => setKnowledge(prev => ({
                        ...prev,
                        company: { ...prev.company, segment: e.target.value }
                      }))}
                      placeholder="Ex: Tecnologia, Varejo, Saúde..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Produtos/Serviços Principais</Label>
                  <Textarea
                    value={knowledge.company.products}
                    onChange={(e) => setKnowledge(prev => ({
                      ...prev,
                      company: { ...prev.company, products: e.target.value }
                    }))}
                    placeholder="Liste os principais produtos ou serviços..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Horários e Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Horário de Funcionamento</Label>
                    <Input
                      value={knowledge.contact.hours}
                      onChange={(e) => setKnowledge(prev => ({
                        ...prev,
                        contact: { ...prev.contact, hours: e.target.value }
                      }))}
                      placeholder="Ex: Seg-Sex 9h às 18h"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefones</Label>
                    <Input
                      value={knowledge.contact.phones}
                      onChange={(e) => setKnowledge(prev => ({
                        ...prev,
                        contact: { ...prev.contact, phones: e.target.value }
                      }))}
                      placeholder="Telefones de contato"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Produtos/Serviços Detalhados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={knowledge.products}
                  onChange={(e) => setKnowledge(prev => ({ ...prev, products: e.target.value }))}
                  placeholder="Descreva detalhadamente seus produtos/serviços, preços, prazos..."
                  rows={6}
                />
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Políticas e Procedimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={knowledge.policies}
                  onChange={(e) => setKnowledge(prev => ({ ...prev, policies: e.target.value }))}
                  placeholder="Políticas de trocas, devoluções, formas de pagamento, garantias..."
                  rows={6}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Velocidade de Resposta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select 
                    value={behavior.responseSpeed} 
                    onValueChange={(v) => setBehavior(prev => ({ ...prev, responseSpeed: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Imediata</SelectItem>
                      <SelectItem value="30s">30 segundos</SelectItem>
                      <SelectItem value="1m">1 minuto</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-between">
                    <Label>Confirmar recebimento</Label>
                    <Switch
                      checked={behavior.confirmReceipt}
                      onCheckedChange={(v) => setBehavior(prev => ({ ...prev, confirmReceipt: v }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Uso de Emojis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={behavior.emojiLevel} 
                    onValueChange={(v) => setBehavior(prev => ({ ...prev, emojiLevel: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="few">Poucos</SelectItem>
                      <SelectItem value="moderate">Moderado</SelectItem>
                      <SelectItem value="many">Muitos</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="glass md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Encaminhar para Humano</CardTitle>
                  <CardDescription>Palavras-chave que acionam atendimento humano</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    value={behavior.forwardToHuman.join(", ")}
                    onChange={(e) => setBehavior(prev => ({ 
                      ...prev, 
                      forwardToHuman: e.target.value.split(",").map(s => s.trim()) 
                    }))}
                    placeholder="atendente, humano, pessoa, problema..."
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Configurações de Aprendizado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                  <div>
                    <p className="font-medium">Aprender com conversas</p>
                    <p className="text-sm text-muted-foreground">
                      A IA aprenderá padrões das conversas
                    </p>
                  </div>
                  <Switch
                    checked={learning.enabled}
                    onCheckedChange={(v) => setLearning(prev => ({ ...prev, enabled: v }))}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                    <Label>Nomes de clientes</Label>
                    <Switch
                      checked={learning.learnNames}
                      onCheckedChange={(v) => setLearning(prev => ({ ...prev, learnNames: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                    <Label>Preferências</Label>
                    <Switch
                      checked={learning.learnPreferences}
                      onCheckedChange={(v) => setLearning(prev => ({ ...prev, learnPreferences: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                    <Label>Padrões de compra</Label>
                    <Switch
                      checked={learning.learnPatterns}
                      onCheckedChange={(v) => setLearning(prev => ({ ...prev, learnPatterns: v }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Esquecer informações após</Label>
                  <Select 
                    value={learning.forgetAfter} 
                    onValueChange={(v) => setLearning(prev => ({ ...prev, forgetAfter: v }))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                      <SelectItem value="never">Nunca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Comandos Especiais
                </CardTitle>
                <CardDescription>
                  Palavras-chave que acionam comportamentos específicos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Palavras para pausar IA</Label>
                    <Input
                      value={commands.pauseWords}
                      onChange={(e) => setCommands(prev => ({ ...prev, pauseWords: e.target.value }))}
                      placeholder="pare, pausa, humano"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Palavras para retomar</Label>
                    <Input
                      value={commands.resumeWords}
                      onChange={(e) => setCommands(prev => ({ ...prev, resumeWords: e.target.value }))}
                      placeholder="continue, volte, ia"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Testar IA
                </CardTitle>
                <CardDescription>
                  Simule uma conversa para ver como a IA responderia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Digite uma mensagem de teste..."
                    onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                  />
                  <Button variant="hero" onClick={handleTest}>
                    <Send className="w-4 h-4 mr-2" />
                    Testar
                  </Button>
                </div>

                {testResponse && (
                  <div className="p-4 rounded-lg bg-card border space-y-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" />
                      <span className="font-medium">Resposta da IA:</span>
                    </div>
                    <p className="text-muted-foreground">{testResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientMemoriaIA;
