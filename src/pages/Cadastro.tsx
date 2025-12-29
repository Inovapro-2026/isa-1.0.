import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Bot, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Cadastro = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    empresa: "",
    dataNascimento: "",
    mensagem: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMatricula, setGeneratedMatricula] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Format CPF
    if (name === 'cpf') {
      const formatted = value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
      setFormData({ ...formData, cpf: formatted });
      return;
    }
    
    // Format phone
    if (name === 'telefone') {
      const formatted = value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
      setFormData({ ...formData, telefone: formatted });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error("Você precisa aceitar os termos de uso");
      return;
    }

    setIsLoading(true);

    try {
      // Insert into account_requests
      const { data, error } = await supabase
        .from('account_requests')
        .insert({
          full_name: formData.nome,
          email: formData.email,
          cpf: formData.cpf.replace(/\D/g, ''),
          phone: formData.telefone.replace(/\D/g, ''),
          company_name: formData.empresa || null,
          birth_date: formData.dataNascimento || null,
          message: formData.mensagem || null,
          status: 'pending',
        })
        .select('matricula')
        .single();

      if (error) {
        if (error.message.includes('duplicate')) {
          toast.error("Este email ou CPF já possui uma solicitação");
        } else {
          toast.error("Erro ao enviar solicitação. Tente novamente.");
        }
        console.error('Error:', error);
        return;
      }

      setGeneratedMatricula(data.matricula);
      setSubmitted(true);
      toast.success("Solicitação enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar solicitação");
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <Card variant="glass" className="max-w-md w-full text-center animate-scale-in relative z-10">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center mx-auto mb-6 glow-accent animate-pulse-glow">
              <CheckCircle className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Solicitação Enviada!</h2>
            
            {generatedMatricula && (
              <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-sm text-muted-foreground mb-2">Sua matrícula:</p>
                <p className="text-3xl font-bold text-primary">{generatedMatricula}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-yellow-500 mb-4">
              <Clock className="w-5 h-5 animate-pulse" />
              <span className="font-medium">Aguardando Aprovação</span>
            </div>

            <p className="text-muted-foreground mb-6">
              Nossa equipe analisará seus dados e você receberá um email com as credenciais de acesso em breve.
              Guarde sua matrícula!
            </p>
            
            <div className="flex flex-col gap-3">
              <Link to="/login">
                <Button variant="hero" className="w-full">Ir para Login</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">Voltar ao Início</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-12 h-12 rounded-xl gradient-button flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Bot className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">ISA</span>
        </Link>

        <Card variant="glass" className="animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Solicitar Acesso</CardTitle>
            <CardDescription>
              Preencha seus dados para solicitar acesso à plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome Completo *</label>
                <Input
                  name="nome"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">CPF *</label>
                  <Input
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={handleChange}
                    required
                    className="transition-all duration-200 focus:scale-[1.01]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Nascimento</label>
                  <Input
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={handleChange}
                    className="transition-all duration-200 focus:scale-[1.01]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone *</label>
                <Input
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Empresa (opcional)</label>
                <Input
                  name="empresa"
                  placeholder="Nome da sua empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <Checkbox 
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  Aceito os <span className="text-primary hover:underline">termos de uso</span> e a{" "}
                  <span className="text-primary hover:underline">política de privacidade</span> da plataforma ISA.
                </label>
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                className="w-full transition-all duration-300 hover:scale-[1.02]" 
                size="lg"
                disabled={isLoading || !termsAccepted}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Solicitação"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link to="/login" className="text-primary hover:underline transition-colors">
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cadastro;
