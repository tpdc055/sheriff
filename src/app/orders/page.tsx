'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { rolePermissions, type Order, type OrderStatus } from '@/lib/types';
import { Plus, Search, FileText, CheckCircle, Clock, Send, Stamp, Eye } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<OrderStatus, string> = {
  draft: 'bg-slate-100 text-slate-700', pending_review: 'bg-amber-100 text-amber-700',
  issued: 'bg-sky-100 text-sky-700', served: 'bg-emerald-100 text-emerald-700', executed: 'bg-teal-100 text-teal-700',
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  draft: <FileText className="w-4 h-4" />, pending_review: <Clock className="w-4 h-4" />,
  issued: <Stamp className="w-4 h-4" />, served: <Send className="w-4 h-4" />, executed: <CheckCircle className="w-4 h-4" />,
};

export default function OrdersPage() {
  const { orders, cases, currentUser, addOrder, updateOrder, addAuditLog } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const permissions = currentUser ? rolePermissions[currentUser.role] : null;

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) || o.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const caseId = formData.get('caseId') as string;
    const selectedCase = cases.find(c => c.id === caseId);
    if (!selectedCase) return;

    const newOrder: Order = {
      id: `ord_${Date.now()}`, caseId, caseNumber: selectedCase.caseNumber,
      type: formData.get('type') as Order['type'], status: 'draft', title: formData.get('title') as string,
      content: formData.get('content') as string, createdAt: new Date().toISOString(),
    };
    addOrder(newOrder);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.name || '', userRole: currentUser?.role || 'judge', action: 'create', module: 'Orders', entityType: 'order', entityId: newOrder.id, description: `Created order: ${newOrder.title}`, ipAddress: '192.168.1.100' });
    toast.success('Order created as draft');
    setIsCreateOpen(false);
  };

  const handleIssueOrder = (order: Order) => {
    updateOrder(order.id, { status: 'issued', issuedBy: currentUser?.name, issuedDate: new Date().toISOString().split('T')[0] });
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.name || '', userRole: currentUser?.role || 'judge', action: 'approve', module: 'Orders', entityType: 'order', entityId: order.id, description: `Issued order: ${order.title}`, ipAddress: '192.168.1.100' });
    toast.success('Order issued successfully');
    setSelectedOrder(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Orders & Directions</h1><p className="text-sm text-muted-foreground mt-0.5">Court orders and judicial directions</p></div>
        {permissions?.canCreateOrders && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />New Order</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Create New Order</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Case</label>
                    <Select name="caseId" required><SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                      <SelectContent>{cases.filter(c => c.status !== 'closed').map(c => (<SelectItem key={c.id} value={c.id}>{c.caseNumber}</SelectItem>))}</SelectContent></Select></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Order Type</label>
                    <Select name="type" defaultValue="direction"><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="direction">Direction</SelectItem><SelectItem value="ruling">Ruling</SelectItem><SelectItem value="judgment">Judgment</SelectItem><SelectItem value="injunction">Injunction</SelectItem><SelectItem value="summons">Summons</SelectItem><SelectItem value="writ">Writ</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-medium">Title</label><Input name="title" placeholder="Order title" required /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Content</label><Textarea name="content" placeholder="IT IS HEREBY ORDERED THAT..." rows={10} required /></div>
                <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button type="submit">Save as Draft</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card><CardContent className="py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="pending_review">Pending Review</SelectItem><SelectItem value="issued">Issued</SelectItem><SelectItem value="served">Served</SelectItem><SelectItem value="executed">Executed</SelectItem></SelectContent></Select>
        </div>
      </CardContent></Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map(order => (
          <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOrder(order)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusColors[order.status].replace('text-', 'bg-').replace('-700', '-100').replace('-100', '-200')}`}>{statusIcons[order.status]}</div>
                <Badge className={`text-[10px] ${statusColors[order.status]}`}>{order.status.replace('_', ' ')}</Badge>
              </div>
              <p className="font-mono text-xs text-muted-foreground mb-1">{order.caseNumber}</p>
              <h3 className="font-medium text-sm line-clamp-2">{order.title}</h3>
              <p className="text-xs text-muted-foreground mt-2 capitalize">{order.type}</p>
              {order.issuedDate && <p className="text-xs text-muted-foreground mt-1">Issued: {order.issuedDate}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredOrders.length === 0 && <div className="text-center py-12 text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No orders found</p></div>}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2"><span className="font-mono text-sm text-muted-foreground">{selectedOrder.caseNumber}</span><Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status.replace('_', ' ')}</Badge></div>
                <DialogTitle>{selectedOrder.title}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[400px] mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Type</p><p className="font-medium capitalize">{selectedOrder.type}</p></div>
                    <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p></div>
                    {selectedOrder.issuedBy && <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Issued By</p><p className="font-medium">{selectedOrder.issuedBy}</p></div>}
                    {selectedOrder.issuedDate && <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Issued Date</p><p className="font-medium">{selectedOrder.issuedDate}</p></div>}
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border"><p className="text-sm whitespace-pre-wrap font-mono">{selectedOrder.content}</p></div>
                </div>
              </ScrollArea>
              {permissions?.canIssueOrders && selectedOrder.status === 'draft' && (
                <div className="flex justify-end gap-2 pt-4 border-t"><Button variant="outline">Submit for Review</Button><Button onClick={() => handleIssueOrder(selectedOrder)} className="gap-2"><Stamp className="w-4 h-4" />Issue Order</Button></div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
