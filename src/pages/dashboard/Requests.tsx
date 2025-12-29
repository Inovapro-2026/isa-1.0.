import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, CheckCircle, XCircle, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Request {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  empresa: string;
  data: string;
  status: "pending" | "approved" | "rejected";
}

const initialRequests: Request[] = [
  { id: 1, nome: "Lucas Ferreira", email: "lucas@email.com", cpf: "123.456.789-00", telefone: "(11) 99999-0001", empresa: "Tech Solutions", data: "28/12/2024", status: "pending" },
  { id: 2, nome: "Fernanda Alves", email: "fernanda@email.com", cpf: "234.567.890-11", telefone: "(11) 99999-0002", empresa: "Marketing Pro", data: "28/12/2024", status: "pending" },
  { id: 3, nome: "Ricardo Souza", email: "ricardo@email.com", cpf: "345.678.901-22", telefone: "(11) 99999-0003", empresa: "", data: "27/12/2024", status: "pending" },
  { id: 4, nome: "Juliana Costa", email: "juliana@email.com", cpf: "456.789.012-33", telefone: "(11) 99999-0004", empresa: "Vendas Online", data: "27/12/2024", status: "approved" },
  { id: 5, nome: "Marcos Lima", email: "marcos@email.com", cpf: "567.890.123-44", telefone: "(11) 99999-0005", empresa: "", data: "26/12/2024", status: "rejected" },
];

const Requests = () => {
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");

  const handleAction = (request: Request, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(action);
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (selectedRequest) {
      setRequests(requests.map(r => 
        r.id === selectedRequest.id 
          ? { ...r, status: actionType === "approve" ? "approved" : "rejected" }
          : r
      ));
    }
    setDialogOpen(false);
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Solicitações</h1>
            <p className="text-muted-foreground">Gerencie as solicitações de acesso à plataforma</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            {pendingCount} pendentes
          </Badge>
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
            <Table>
              <TableHeader>
                <TableRow>
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
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        {request.nome}
                      </div>
                    </TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{request.cpf}</TableCell>
                    <TableCell>{request.empresa || "—"}</TableCell>
                    <TableCell>{request.data}</TableCell>
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
                          >
                            <CheckCircle className="w-4 h-4" />
                            Aprovar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleAction(request, "reject")}
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
                  ? `Tem certeza que deseja aprovar a solicitação de ${selectedRequest?.nome}? Um email será enviado com as credenciais de acesso.`
                  : `Tem certeza que deseja reprovar a solicitação de ${selectedRequest?.nome}? Esta ação não pode ser desfeita.`
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant={actionType === "approve" ? "accent" : "destructive"}
                onClick={confirmAction}
              >
                {actionType === "approve" ? "Confirmar Aprovação" : "Confirmar Reprovação"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Requests;
