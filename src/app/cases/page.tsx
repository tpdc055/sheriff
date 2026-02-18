'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { rolePermissions, type Case, type CaseType, type CaseStatus } from '@/lib/types';
import { Plus, Search, FolderOpen, Calendar, User, FileText, Clock, ChevronRight, Building2, Gavel } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<CaseStatus, string> = {
  filed: 'bg-sky-100 text-sky-700', active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700', closed: 'bg-slate-100 text-slate-700', archived: 'bg-gray-100 text-gray-700',
};
const priorityColors = { low: 'bg-slate-100 text-slate-600', medium: 'bg-sky-100 text-sky-700', high: 'bg-amber-100 text-amber-700', urgent: 'bg-red-100 text-red-700' };
const typeIcons: Record<CaseType, React.ReactNode> = {
  civil: <Building2 className="w-4 h-4" />, criminal: <Gavel className="w-4 h-4" />,
  commercial: <FolderOpen className="w-4 h-4" />, family: <User className="w-4 h-4" />, probate: <FileText className="w-4 h-4" />,
};

export default function CasesPage() {
  const { cases, currentUser, addCase, addAuditLog } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const permissions = currentUser ? rolePermissions[currentUser.role] : null;
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) || c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateCase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const caseNum = `HC/${(formData.get('type') as string).toUpperCase().slice(0, 2)}/2026/${String(cases.length + 143).padStart(4, '0')}`;
    const newCase: Case = {
      id: `case_${Date.now()}`, caseNumber: caseNum, title: formData.get('title') as string,
      type: formData.get('type') as CaseType, status: 'filed', priority: formData.get('priority') as Case['priority'],
      filingDate: new Date().toISOString().split('T')[0], lastActivity: new Date().toISOString().split('T')[0],
      parties: [
        { id: `pty_${Date.now()}_1`, name: formData.get('plaintiff') as string, type: 'plaintiff' },
        { id: `pty_${Date.now()}_2`, name: formData.get('defendant') as string, type: 'defendant' },
      ],
      events: [{ id: `evt_${Date.now()}`, caseId: `case_${Date.now()}`, date: new Date().toISOString().split('T')[0], type: 'filing', title: 'Case Filed', description: 'Initial case filing', createdBy: currentUser?.name || 'System' }],
      documents: [], filingFee: Number(formData.get('filingFee')) || 0, feePaid: false,
      filingReference: `RCP-2026-${String(cases.length + 143).padStart(4, '0')}-${String.fromCharCode(65 + (cases.length % 26))}`,
    };
    addCase(newCase);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.name || '', userRole: currentUser?.role || 'registry', action: 'create', module: 'Cases', entityType: 'case', entityId: newCase.id, description: `Created case: ${newCase.caseNumber}`, ipAddress: '192.168.1.100' });
    toast.success('Case created successfully', { description: `Filing Reference: ${newCase.filingReference}` });
    setIsCreateOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Cases</h1><p className="text-sm text-muted-foreground mt-0.5">Registry & filing management</p></div>
        {permissions?.canCreateCase && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />New Case</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>File New Case</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateCase} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Case Type</label>
                    <Select name="type" defaultValue="civil"><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="civil">Civil</SelectItem><SelectItem value="criminal">Criminal</SelectItem><SelectItem value="commercial">Commercial</SelectItem><SelectItem value="family">Family</SelectItem><SelectItem value="probate">Probate</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Priority</label>
                    <Select name="priority" defaultValue="medium"><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium">Case Title</label><Input name="title" placeholder="e.g., ABC Corp v. XYZ Ltd" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Plaintiff/Petitioner</label><Input name="plaintiff" placeholder="Party name" required /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Defendant/Respondent</label><Input name="defendant" placeholder="Party name" required /></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium">Filing Fee (KES)</label><Input name="filingFee" type="number" placeholder="0" /></div>
                <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button type="submit">File Case</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card><CardContent className="py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search cases..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="filed">Filed</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="civil">Civil</SelectItem><SelectItem value="criminal">Criminal</SelectItem><SelectItem value="commercial">Commercial</SelectItem><SelectItem value="family">Family</SelectItem><SelectItem value="probate">Probate</SelectItem></SelectContent></Select>
        </div>
      </CardContent></Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCases.map(caseItem => (
          <Card key={caseItem.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCase(caseItem)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1"><span className="text-xs font-mono text-muted-foreground">{caseItem.caseNumber}</span><Badge className={`text-[10px] px-1.5 py-0 ${statusColors[caseItem.status]}`}>{caseItem.status}</Badge></div>
                  <h3 className="font-medium text-sm truncate">{caseItem.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground"><span className="flex items-center gap-1 capitalize">{typeIcons[caseItem.type]}{caseItem.type}</span><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{caseItem.filingDate}</span></div>
                </div>
                <div className="flex flex-col items-end gap-2"><Badge className={`text-[10px] ${priorityColors[caseItem.priority]}`}>{caseItem.priority}</Badge>{caseItem.nextHearing && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Next: {caseItem.nextHearing}</span>}</div>
              </div>
              {caseItem.assignedJudge && <div className="mt-3 pt-3 border-t flex items-center justify-between"><span className="text-xs text-muted-foreground"><User className="w-3 h-3 inline mr-1" />{caseItem.assignedJudge}</span><ChevronRight className="w-4 h-4 text-muted-foreground" /></div>}
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredCases.length === 0 && <div className="text-center py-12 text-muted-foreground"><FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No cases found</p></div>}

      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          {selectedCase && (
            <>
              <DialogHeader><div className="flex items-center gap-2"><span className="font-mono text-sm text-muted-foreground">{selectedCase.caseNumber}</span><Badge className={statusColors[selectedCase.status]}>{selectedCase.status}</Badge></div><DialogTitle className="text-lg">{selectedCase.title}</DialogTitle></DialogHeader>
              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid grid-cols-4 w-full"><TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="parties">Parties</TabsTrigger><TabsTrigger value="timeline">Timeline</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger></TabsList>
                <ScrollArea className="h-[400px] mt-4">
                  <TabsContent value="details" className="space-y-4 m-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Type</p><p className="font-medium capitalize">{selectedCase.type}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Priority</p><p className="font-medium capitalize">{selectedCase.priority}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Filing Date</p><p className="font-medium">{selectedCase.filingDate}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Reference</p><p className="font-medium font-mono text-sm">{selectedCase.filingReference}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Judge</p><p className="font-medium">{selectedCase.assignedJudge || 'Not assigned'}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Court</p><p className="font-medium">{selectedCase.assignedCourt || 'Not assigned'}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50 col-span-2"><p className="text-xs text-muted-foreground">Filing Fee</p><p className="font-medium">KES {selectedCase.filingFee.toLocaleString()}{selectedCase.feePaid ? <Badge className="ml-2 bg-emerald-100 text-emerald-700">Paid</Badge> : <Badge className="ml-2 bg-red-100 text-red-700">Unpaid</Badge>}</p></div>
                    </div>
                  </TabsContent>
                  <TabsContent value="parties" className="space-y-3 m-0">{selectedCase.parties.map(party => (<div key={party.id} className="p-4 rounded-lg bg-muted/50"><Badge variant="outline" className="capitalize mb-2">{party.type}</Badge><p className="font-medium">{party.name}</p>{party.counsel && <p className="text-sm text-muted-foreground mt-1">Counsel: {party.counsel}</p>}</div>))}</TabsContent>
                  <TabsContent value="timeline" className="m-0"><div className="relative pl-6 space-y-4"><div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />{selectedCase.events.map(event => (<div key={event.id} className="relative"><div className="absolute -left-4 w-3 h-3 rounded-full bg-primary border-2 border-background" /><div className="p-3 rounded-lg bg-muted/50"><div className="flex items-center justify-between mb-1"><Badge variant="outline" className="text-[10px] capitalize">{event.type}</Badge><span className="text-xs text-muted-foreground">{event.date}</span></div><p className="font-medium text-sm">{event.title}</p><p className="text-xs text-muted-foreground mt-1">{event.description}</p></div></div>))}{selectedCase.events.length === 0 && <p className="text-sm text-muted-foreground py-4">No events</p>}</div></TabsContent>
                  <TabsContent value="documents" className="space-y-3 m-0">{selectedCase.documents.map(doc => (<div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"><FileText className="w-8 h-8 text-muted-foreground" /><div className="flex-1"><p className="font-medium text-sm">{doc.name}</p><p className="text-xs text-muted-foreground">{doc.type} • {doc.size}</p></div>{doc.restricted && <Badge variant="destructive" className="text-[10px]">Restricted</Badge>}</div>))}{selectedCase.documents.length === 0 && <div className="text-center py-8 text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No documents</p></div>}</TabsContent>
                </ScrollArea>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
