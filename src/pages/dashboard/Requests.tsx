import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FileText, CheckCircle, XCircle, Clock, User, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SkeletonTable } from "@/components/ui/skeleton-card";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AccountRequest {
  id: string;
  full_name: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  company_name: string | null;
  matricula: string | null;
  created_at: string | null;
  status: 'pending' | 'approved' | 'rejected' | null;
  rejection_reason: string | null;
}

const Requests = () => {
  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccountRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AccountRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('account_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Erro ao carregar solicitações');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.full_name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.matricula?.includes(term) ||
        r.cpf?.includes(term)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleAction = (request: AccountRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(action);
    setRejectionReason("");
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest || !user) return;
    
    setIsProcessing(true);

    try {
      const updateData: Record<string, unknown> = {
        status: actionType === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      };

      if (actionType === 'reject' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('account_requests')
        .update(updateData)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Log the action
      await supabase.from('system_logs').insert({
        action: actionType === 'approve' 
          ? `Cliente ${selectedRequest.full_name} aprovado`
          : `Solicitação de ${selectedRequest.full_name} reprovada`,
        user_id: user.id,
        details: { request_id: selectedRequest.id, matricula: selectedRequest.matricula },
      });

      toast.success(
        actionType === 'approve'
          ? `Solicitação de ${selectedRequest.full_name} aprovada!`
          : `Solicitação de ${selectedRequest.full_name} reprovada.`
      );

      // Update local state
      setRequests(requests.map(r =>
        r.id === selectedRequest.id
          ? { ...r, status: actionType === 'approve' ? 'approved' : 'rejected' }
          : r
      ));

      setDialogOpen(false);
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error('Erro ao processar solicitação');
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatCPF = (cpf: string | null) => {
    if (!cpf) return '—';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Solicitações</h1>
            <p className="text-muted-foreground">Gerencie as solicitações de acesso à plataforma</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 w-fit">
            <Clock className="w-4 h-4 mr-2" />
            {pendingCount} pendentes
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, matrícula ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="transition-all duration-200"
              >
                {status === 'all' && 'Todos'}
                {status === 'pending' && 'Pendentes'}
                {status === 'approved' && 'Aprovados'}
                {status === 'rejected' && 'Reprovados'}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Lista de Solicitações
            </CardTitle>
            <CardDescription>
              Aprove ou reprove solicitações de novos clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable />
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma solicitação encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id} className="transition-colors hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-primary">
                          {request.matricula || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{request.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{request.email}</TableCell>
                        <TableCell className="font-mono text-sm">{formatCPF(request.cpf)}</TableCell>
                        <TableCell>{request.company_name || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(request.created_at)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              request.status === "pending" ? "outline" : 
                              request.status === "approved" ? "default" : "destructive"
                            }
                            className={request.status === "approved" ? "bg-accent text-accent-foreground" : ""}
                          >
                            {request.status === "pending" && "Pendente"}
                            {request.status === "approved" && "Aprovado"}
                            {request.status === "rejected" && "Reprovado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === "pending" && (
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="accent" 
                                size="sm"
                                onClick={() => handleAction(request, "approve")}
                                className="transition-all duration-200 hover:scale-105"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Aprovar
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleAction(request, "reject")}
                                className="transition-all duration-200 hover:scale-105"
                              >
                                <XCircle className="w-4 h-4" />
                                Reprovar
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>
                {actionType === "approve" ? "Aprovar Solicitação" : "Reprovar Solicitação"}
              </DialogTitle>
              <DialogDescription>
                {actionType === "approve" 
                  ? `Tem certeza que deseja aprovar a solicitação de ${selectedRequest?.full_name}? 
                     Uma conta será criada e a matrícula ${selectedRequest?.matricula} será ativada.`
                  : `Tem certeza que deseja reprovar a solicitação de ${selectedRequest?.full_name}?`
                }
              </DialogDescription>
            </DialogHeader>
            
            {actionType === "reject" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo da reprovação (opcional)</label>
                <Textarea
                  placeholder="Descreva o motivo da reprovação..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isProcessing}>
                Cancelar
              </Button>
              <Button 
                variant={actionType === "approve" ? "accent" : "destructive"}
                onClick={confirmAction}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : actionType === "approve" ? (
                  "Confirmar Aprovação"
                ) : (
                  "Confirmar Reprovação"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Requests;
