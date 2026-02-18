'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Plus, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { rolePermissions, type Hearing, type HearingStatus } from '@/lib/types';
import { toast } from 'sonner';

const statusColors: Record<HearingStatus, string> = {
  scheduled: 'bg-sky-100 text-sky-700', completed: 'bg-emerald-100 text-emerald-700',
  adjourned: 'bg-amber-100 text-amber-700', cancelled: 'bg-red-100 text-red-700',
};

const typeColors = {
  mention: 'bg-slate-100 text-slate-700', trial: 'bg-rose-100 text-rose-700',
  ruling: 'bg-purple-100 text-purple-700', directions: 'bg-sky-100 text-sky-700',
  status: 'bg-teal-100 text-teal-700', settlement: 'bg-emerald-100 text-emerald-700',
};

export default function SchedulingPage() {
  const { hearings, cases, currentUser, addHearing, addAuditLog } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const permissions = currentUser ? rolePermissions[currentUser.role] : null;

  const getWeekDates = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates(selectedDate);
  const filteredHearings = viewMode === 'day'
    ? hearings.filter(h => h.date === selectedDate)
    : hearings.filter(h => weekDates.includes(h.date));

  const navigateDate = (direction: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (viewMode === 'day' ? direction : direction * 7));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleCreateHearing = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const caseId = formData.get('caseId') as string;
    const selectedCase = cases.find(c => c.id === caseId);
    if (!selectedCase) return;

    const newHearing: Hearing = {
      id: `hrg_${Date.now()}`, caseId, caseNumber: selectedCase.caseNumber, caseTitle: selectedCase.title,
      type: formData.get('type') as Hearing['type'], status: 'scheduled',
      date: formData.get('date') as string, time: formData.get('time') as string,
      duration: Number(formData.get('duration')), court: formData.get('court') as string,
      judge: selectedCase.assignedJudge || 'TBD', notes: formData.get('notes') as string,
    };
    addHearing(newHearing);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.name || '', userRole: currentUser?.role || 'registry', action: 'create', module: 'Scheduling', entityType: 'hearing', entityId: newHearing.id, description: `Scheduled hearing for ${selectedCase.caseNumber}`, ipAddress: '192.168.1.100' });
    toast.success('Hearing scheduled', { description: `${selectedCase.caseNumber} on ${newHearing.date}` });
    setIsCreateOpen(false);
  };

  const groupedByTime = filteredHearings.reduce((acc, h) => {
    const key = viewMode === 'day' ? h.time : h.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(h);
    return acc;
  }, {} as Record<string, Hearing[]>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Scheduling</h1><p className="text-sm text-muted-foreground mt-0.5">Hearing listings & cause list</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <Button variant={viewMode === 'day' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('day')}>Day</Button>
            <Button variant={viewMode === 'week' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('week')}>Week</Button>
          </div>
          {permissions?.canScheduleHearings && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Schedule Hearing</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Schedule New Hearing</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateHearing} className="space-y-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Case</label>
                    <Select name="caseId" required><SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                      <SelectContent>{cases.filter(c => c.status !== 'closed').map(c => (<SelectItem key={c.id} value={c.id}>{c.caseNumber} - {c.title.slice(0, 30)}...</SelectItem>))}</SelectContent></Select></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Date</label><Input name="date" type="date" defaultValue={selectedDate} required /></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Time</label><Input name="time" type="time" defaultValue="09:00" required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium">Type</label>
                      <Select name="type" defaultValue="mention"><SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="mention">Mention</SelectItem><SelectItem value="directions">Directions</SelectItem><SelectItem value="trial">Trial</SelectItem><SelectItem value="ruling">Ruling</SelectItem><SelectItem value="status">Status</SelectItem><SelectItem value="settlement">Settlement</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><label className="text-sm font-medium">Duration (min)</label><Input name="duration" type="number" defaultValue="30" /></div>
                  </div>
                  <div className="space-y-2"><label className="text-sm font-medium">Court/Room</label><Input name="court" placeholder="e.g., Civil Court 3" required /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Notes</label><Textarea name="notes" placeholder="Optional notes..." rows={2} /></div>
                  <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button type="submit">Schedule</Button></div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}><ChevronLeft className="w-4 h-4" /></Button>
              <div className="text-center">
                <p className="font-semibold">{viewMode === 'day' ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : `Week of ${new Date(weekDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}</p>
                <p className="text-xs text-muted-foreground">{filteredHearings.length} hearing(s)</p>
              </div>
              <Button variant="outline" size="icon" onClick={() => navigateDate(1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>Today</Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'day' ? (
            <div className="space-y-3">
              {Object.entries(groupedByTime).sort(([a], [b]) => a.localeCompare(b)).map(([time, items]) => (
                <div key={time} className="flex gap-4">
                  <div className="w-16 text-sm font-medium text-muted-foreground pt-3">{time}</div>
                  <div className="flex-1 space-y-2">
                    {items.map(hearing => (
                      <div key={hearing.id} className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm">{hearing.caseNumber}</span>
                              <Badge className={`text-[10px] ${typeColors[hearing.type as keyof typeof typeColors]}`}>{hearing.type}</Badge>
                              <Badge className={`text-[10px] ${statusColors[hearing.status]}`}>{hearing.status}</Badge>
                            </div>
                            <p className="text-sm font-medium">{hearing.caseTitle}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{hearing.duration} min</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{hearing.court}</span>
                              <span className="flex items-center gap-1"><User className="w-3 h-3" />{hearing.judge}</span>
                            </div>
                          </div>
                        </div>
                        {hearing.notes && <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">{hearing.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredHearings.length === 0 && <div className="text-center py-12 text-muted-foreground"><Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No hearings scheduled for this day</p></div>}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {weekDates.map(date => (
                <div key={date} className="space-y-2">
                  <div className={`text-center p-2 rounded-lg ${date === new Date().toISOString().split('T')[0] ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-xs">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <p className="text-lg font-bold">{new Date(date).getDate()}</p>
                  </div>
                  <div className="space-y-2">
                    {hearings.filter(h => h.date === date).map(hearing => (
                      <div key={hearing.id} className="p-2 rounded border text-xs">
                        <p className="font-medium truncate">{hearing.time}</p>
                        <p className="text-muted-foreground truncate">{hearing.caseNumber}</p>
                        <Badge className={`text-[8px] mt-1 ${typeColors[hearing.type as keyof typeof typeColors]}`}>{hearing.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
