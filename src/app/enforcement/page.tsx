'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { rolePermissions, type Writ, type EnforcementStatus, type ServiceStatus } from '@/lib/types';
import { Plus, Search, Shield, MapPin, User, Clock, Truck, Package, DollarSign, CheckCircle2, AlertCircle, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const enforcementStatusColors: Record<EnforcementStatus, string> = {
  pending: 'bg-slate-100 text-slate-700', in_progress: 'bg-amber-100 text-amber-700',
  executed: 'bg-emerald-100 text-emerald-700', closed: 'bg-teal-100 text-teal-700', stayed: 'bg-red-100 text-red-700',
};

const serviceStatusColors: Record<ServiceStatus, string> = {
  pending: 'bg-slate-100 text-slate-700', attempted: 'bg-amber-100 text-amber-700',
  served: 'bg-emerald-100 text-emerald-700', failed: 'bg-red-100 text-red-700', returned: 'bg-purple-100 text-purple-700',
};

const writTypeIcons = {
  execution: <DollarSign className="w-4 h-4" />, attachment: <Package className="w-4 h-4" />,
  possession: <MapPin className="w-4 h-4" />, arrest: <User className="w-4 h-4" />, search: <Search className="w-4 h-4" />,
};

export default function EnforcementPage() {
  const { writs, orders, currentUser, updateWrit, addAuditLog } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWrit, setSelectedWrit] = useState<Writ | null>(null);
  const [isAttemptOpen, setIsAttemptOpen] = useState(false);
  const permissions = currentUser ? rolePermissions[currentUser.role] : null;

  const filteredWrits = writs.filter(w => {
    const matchesSearch = w.writNumber.toLowerCase().includes(searchQuery.toLowerCase()) || w.targetParty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: writs.length,
    pending: writs.filter(w => w.status === 'pending').length,
    inProgress: writs.filter(w => w.status === 'in_progress').length,
    executed: writs.filter(w => w.status === 'executed' || w.status === 'closed').length,
    totalFees: writs.reduce((sum, w) => sum + w.totalFeesCharged, 0),
    collectedFees: writs.reduce((sum, w) => sum + w.totalFeesCollected, 0),
  };

  const handleAddServiceAttempt = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedWrit) return;
    const formData = new FormData(e.currentTarget);
    const outcome = formData.get('outcome') as string;
    const newAttempt = {
      id: `svc_${Date.now()}`, writId: selectedWrit.id,
      date: formData.get('date') as string, officer: currentUser?.name || 'Unknown',
      outcome: outcome as 'served' | 'refused' | 'not_found' | 'address_incorrect' | 'other',
      notes: formData.get('notes') as string, location: formData.get('location') as string,
    };
    const newStatus = outcome === 'served' ? 'served' : 'attempted';
    updateWrit(selectedWrit.id, {
      serviceAttempts: [...selectedWrit.serviceAttempts, newAttempt],
      serviceStatus: newStatus as ServiceStatus,
      status: outcome === 'served' ? 'in_progress' : selectedWrit.status,
    });
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.name || '', userRole: currentUser?.role || 'sheriff', action: 'update', module: 'Enforcement', entityType: 'writ', entityId: selectedWrit.id, description: `Added service attempt: ${outcome}`, ipAddress: '192.168.1.100' });
    toast.success('Service attempt recorded');
    setIsAttemptOpen(false);
    setSelectedWrit({ ...selectedWrit, serviceAttempts: [...selectedWrit.serviceAttempts, newAttempt], serviceStatus: newStatus as ServiceStatus });
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString('en-US')}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Enforcement</h1><p className="text-sm text-muted-foreground mt-0.5">Sheriff's office & writ execution</p></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold">{stats.pending}</p></div><div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><Clock className="w-5 h-5 text-slate-600" /></div></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold">{stats.inProgress}</p></div><div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><Truck className="w-5 h-5 text-amber-600" /></div></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold">{stats.executed}</p></div><div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div></div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Fees Collected</p><p className="text-xl font-bold">{formatCurrency(stats.collectedFees)}</p><p className="text-xs text-muted-foreground">of {formatCurrency(stats.totalFees)}</p></div><div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center"><DollarSign className="w-5 h-5 text-teal-600" /></div></div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card><CardContent className="py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search writs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="executed">Executed</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select>
        </div>
      </CardContent></Card>

      {/* Writs List */}
      <div className="space-y-4">
        {filteredWrits.map(writ => (
          <Card key={writ.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedWrit(writ)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${enforcementStatusColors[writ.status].replace('text-', 'bg-').replace('-700', '-200')}`}>
                    {writTypeIcons[writ.type as keyof typeof writTypeIcons]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-medium">{writ.writNumber}</span>
                      <Badge className={`text-[10px] ${enforcementStatusColors[writ.status]}`}>{writ.status.replace('_', ' ')}</Badge>
                      <Badge className={`text-[10px] ${serviceStatusColors[writ.serviceStatus]}`}>Service: {writ.serviceStatus}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{writ.caseNumber}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{writ.targetParty}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{writ.targetAddress}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize">{writ.type} Writ</p>
                  <p className="text-xs text-muted-foreground mt-1">{writ.serviceAttempts.length} attempt(s)</p>
                  {writ.assignedOfficer && <p className="text-xs text-muted-foreground mt-1">{writ.assignedOfficer}</p>}
                </div>
              </div>
              {writ.seizureItems.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium mb-2">Seized Items ({writ.seizureItems.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {writ.seizureItems.slice(0, 3).map(item => (
                      <Badge key={item.id} variant="outline" className="text-[10px]">{item.description.slice(0, 30)}...</Badge>
                    ))}
                    {writ.seizureItems.length > 3 && <Badge variant="outline" className="text-[10px]">+{writ.seizureItems.length - 3} more</Badge>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredWrits.length === 0 && <div className="text-center py-12 text-muted-foreground"><Shield className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No enforcement actions found</p></div>}

      {/* Writ Detail Dialog */}
      <Dialog open={!!selectedWrit} onOpenChange={() => setSelectedWrit(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          {selectedWrit && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2"><span className="font-mono text-sm">{selectedWrit.writNumber}</span><Badge className={enforcementStatusColors[selectedWrit.status]}>{selectedWrit.status.replace('_', ' ')}</Badge></div>
                <DialogTitle className="text-lg">{selectedWrit.type.charAt(0).toUpperCase() + selectedWrit.type.slice(1)} Writ - {selectedWrit.caseNumber}</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="grid grid-cols-4 w-full"><TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="attempts">Service Attempts</TabsTrigger><TabsTrigger value="seizures">Seizure Inventory</TabsTrigger><TabsTrigger value="fees">Fees Ledger</TabsTrigger></TabsList>
                <ScrollArea className="h-[400px] mt-4">
                  <TabsContent value="details" className="space-y-4 m-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Target Party</p><p className="font-medium">{selectedWrit.targetParty}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Target Address</p><p className="font-medium">{selectedWrit.targetAddress}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Issued Date</p><p className="font-medium">{selectedWrit.issuedDate}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Expiry Date</p><p className="font-medium">{selectedWrit.expiryDate}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Assigned Officer</p><p className="font-medium">{selectedWrit.assignedOfficer || 'Not assigned'}</p></div>
                      <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Service Status</p><Badge className={serviceStatusColors[selectedWrit.serviceStatus]}>{selectedWrit.serviceStatus}</Badge></div>
                    </div>
                    {permissions?.canManageEnforcement && (
                      <div className="flex gap-2 pt-4">
                        <Dialog open={isAttemptOpen} onOpenChange={setIsAttemptOpen}>
                          <DialogTrigger asChild><Button variant="outline" className="gap-2"><Plus className="w-4 h-4" />Log Service Attempt</Button></DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Log Service Attempt</DialogTitle></DialogHeader>
                            <form onSubmit={handleAddServiceAttempt} className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><label className="text-sm font-medium">Date</label><Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required /></div>
                                <div className="space-y-2"><label className="text-sm font-medium">Outcome</label>
                                  <Select name="outcome" defaultValue="not_found"><SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="served">Served</SelectItem><SelectItem value="refused">Refused</SelectItem><SelectItem value="not_found">Not Found</SelectItem><SelectItem value="address_incorrect">Address Incorrect</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                              </div>
                              <div className="space-y-2"><label className="text-sm font-medium">Location</label><Input name="location" placeholder="Service location" /></div>
                              <div className="space-y-2"><label className="text-sm font-medium">Notes</label><Textarea name="notes" placeholder="Details of the attempt..." rows={3} /></div>
                              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsAttemptOpen(false)}>Cancel</Button><Button type="submit">Log Attempt</Button></div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="attempts" className="space-y-3 m-0">
                    {selectedWrit.serviceAttempts.map((attempt, idx) => (
                      <div key={attempt.id} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2"><Badge variant="outline">Attempt {idx + 1}</Badge><Badge className={attempt.outcome === 'served' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>{attempt.outcome.replace('_', ' ')}</Badge></div>
                          <span className="text-xs text-muted-foreground">{attempt.date}</span>
                        </div>
                        <p className="text-sm"><strong>Officer:</strong> {attempt.officer}</p>
                        {attempt.location && <p className="text-sm"><strong>Location:</strong> {attempt.location}</p>}
                        <p className="text-sm text-muted-foreground mt-2">{attempt.notes}</p>
                      </div>
                    ))}
                    {selectedWrit.serviceAttempts.length === 0 && <div className="text-center py-8 text-muted-foreground"><AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No service attempts recorded</p></div>}
                  </TabsContent>
                  <TabsContent value="seizures" className="space-y-3 m-0">
                    {selectedWrit.seizureItems.map(item => (
                      <div key={item.id} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-2"><p className="font-medium">{item.description}</p><Badge variant="outline" className="capitalize">{item.status}</Badge></div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p><strong>Est. Value:</strong> {formatCurrency(item.estimatedValue)}</p>
                          <p><strong>Condition:</strong> {item.condition}</p>
                          <p><strong>Location:</strong> {item.location}</p>
                          <p><strong>Seized:</strong> {item.seizedDate}</p>
                        </div>
                      </div>
                    ))}
                    {selectedWrit.seizureItems.length === 0 && <div className="text-center py-8 text-muted-foreground"><Package className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No items seized</p></div>}
                  </TabsContent>
                  <TabsContent value="fees" className="space-y-3 m-0">
                    <div className="p-4 rounded-lg bg-muted/50 mb-4">
                      <div className="flex items-center justify-between mb-2"><p className="text-sm font-medium">Collection Progress</p><p className="text-sm">{formatCurrency(selectedWrit.totalFeesCollected)} / {formatCurrency(selectedWrit.totalFeesCharged)}</p></div>
                      <Progress value={(selectedWrit.totalFeesCollected / selectedWrit.totalFeesCharged) * 100} className="h-2" />
                    </div>
                    {selectedWrit.fees.map(fee => (
                      <div key={fee.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div><p className="font-medium text-sm">{fee.description}</p>{fee.receiptNumber && <p className="text-xs text-muted-foreground">Receipt: {fee.receiptNumber}</p>}</div>
                        <div className="text-right"><p className="font-medium">{formatCurrency(fee.amount)}</p><Badge className={fee.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>{fee.paid ? 'Paid' : 'Unpaid'}</Badge></div>
                      </div>
                    ))}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
