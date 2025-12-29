import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Cadastro = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    empresa: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
            <div className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center mx-auto mb-6 glow-accent">
              <CheckCircle className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Solicitação Enviada!</h2>
            <p className="text-muted-foreground mb-6">
              Sua solicitação de acesso foi enviada com sucesso. 
              Nossa equipe analisará seus dados e você receberá um email com as credenciais em breve.
            </p>
            <Link to="/">
              <Button variant="hero">Voltar ao Início</Button>
            </Link>
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
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-button flex items-center justify-center">
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
                <label className="text-sm font-medium">Nome Completo</label>
                <Input
                  name="nome"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">CPF</label>
                <Input
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Empresa (opcional)</label>
                <Input
                  name="empresa"
                  placeholder="Nome da sua empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                />
              </div>

              <Button type="submit" variant="hero" className="w-full" size="lg">
                Enviar Solicitação
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link to="/login" className="text-primary hover:underline">
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
