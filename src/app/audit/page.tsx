'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AuditAction, UserRole } from '@/lib/types';
import { Search, ScrollText, User, Clock, Monitor, ArrowRight } from 'lucide-react';

const actionColors: Record<AuditAction, string> = {
  create: 'bg-emerald-100 text-emerald-700', update: 'bg-sky-100 text-sky-700',
  delete: 'bg-red-100 text-red-700', view: 'bg-slate-100 text-slate-700',
  login: 'bg-teal-100 text-teal-700', logout: 'bg-gray-100 text-gray-700',
  approve: 'bg-emerald-100 text-emerald-700', reject: 'bg-red-100 text-red-700',
  assign: 'bg-purple-100 text-purple-700', upload: 'bg-amber-100 text-amber-700',
  download: 'bg-sky-100 text-sky-700',
};

const roleColors: Record<UserRole, string> = {
  registrar: 'bg-amber-100 text-amber-700', registry: 'bg-emerald-100 text-emerald-700',
  judge: 'bg-rose-100 text-rose-700', associate: 'bg-sky-100 text-sky-700',
  sheriff: 'bg-slate-100 text-slate-700', finance: 'bg-teal-100 text-teal-700',
  admin: 'bg-violet-100 text-violet-700',
};

export default function AuditPage() {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const modules = [...new Set(auditLogs.map(l => l.module))];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesAction && matchesModule;
  });

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return { date: date.toLocaleDateString(), time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Audit Log</h1><p className="text-sm text-muted-foreground mt-0.5">System activity and change tracking</p></div>
        <Badge variant="outline" className="gap-1.5"><ScrollText className="w-3 h-3" />{auditLogs.length} entries</Badge>
      </div>

      <Card><CardContent className="py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
          <Select value={actionFilter} onValueChange={setActionFilter}><SelectTrigger className="w-[140px]"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Actions</SelectItem><SelectItem value="create">Create</SelectItem><SelectItem value="update">Update</SelectItem><SelectItem value="delete">Delete</SelectItem><SelectItem value="view">View</SelectItem><SelectItem value="login">Login</SelectItem><SelectItem value="approve">Approve</SelectItem><SelectItem value="upload">Upload</SelectItem></SelectContent></Select>
          <Select value={moduleFilter} onValueChange={setModuleFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Module" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Modules</SelectItem>{modules.map(m => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select>
        </div>
      </CardContent></Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Activity Timeline</CardTitle></CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredLogs.map(log => {
                const { date, time } = formatTimestamp(log.timestamp);
                return (
                  <div key={log.id} className="flex gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-16 text-center flex-shrink-0">
                      <p className="text-xs text-muted-foreground">{date}</p>
                      <p className="text-sm font-medium">{time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={`text-[10px] ${actionColors[log.action]}`}>{log.action}</Badge>
                        <Badge variant="outline" className="text-[10px]">{log.module}</Badge>
                        <Badge className={`text-[10px] ${roleColors[log.userRole]}`}>{log.userRole}</Badge>
                      </div>
                      <p className="text-sm font-medium">{log.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{log.userName}</span>
                        <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{log.ipAddress}</span>
                        <span className="font-mono">{log.entityType}:{log.entityId}</span>
                      </div>
                      {log.previousValue && log.newValue && (
                        <div className="mt-2 p-2 rounded bg-muted/50 text-xs flex items-center gap-2">
                          <span className="text-red-600 line-through">{log.previousValue}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="text-emerald-600">{log.newValue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      {filteredLogs.length === 0 && <div className="text-center py-12 text-muted-foreground"><ScrollText className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No audit logs found</p></div>}
    </div>
  );
}
