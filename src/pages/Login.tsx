import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Shield, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type LoginType = "admin" | "client";

const Login = () => {
  const [loginType, setLoginType] = useState<LoginType>("admin");
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula login - redireciona para o dashboard correto
    if (loginType === "admin") {
      navigate("/dashboard/admin");
    } else {
      navigate("/dashboard/client");
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-button flex items-center justify-center">
            <Bot className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">ISA</span>
        </Link>

        {/* Login Type Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setLoginType("admin")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              loginType === "admin"
                ? "gradient-button text-primary-foreground glow-primary"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="w-4 h-4" />
            Administrador
          </button>
          <button
            onClick={() => setLoginType("client")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              loginType === "client"
                ? "gradient-button text-primary-foreground glow-primary"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            Cliente
          </button>
        </div>

        {/* Login Card */}
        <Card variant="glass" className="animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {loginType === "admin" ? "Acesso Administrativo" : "Acesso do Cliente"}
            </CardTitle>
            <CardDescription>
              {loginType === "admin"
                ? "Entre com suas credenciais de administrador"
                : "Entre com sua matrícula e senha"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginType === "admin" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="admin@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Matrícula ou CPF</label>
                  <Input
                    type="text"
                    placeholder="Digite sua matrícula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Senha</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="hero" className="w-full" size="lg">
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Não tem conta?{" "}
                <Link to="/cadastro" className="text-primary hover:underline">
                  Solicite acesso
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
