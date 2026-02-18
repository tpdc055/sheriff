'use client';

import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Clock, DollarSign, Users, AlertTriangle, CheckCircle2, Calendar, FileText, Shield } from 'lucide-react';

export default function ReportsPage() {
  const { stats, cases, hearings, writs, orders } = useApp();

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString('en-US')}`;

  const caseAgeDistribution = stats.casesByAge;
  const totalCasesByAge = caseAgeDistribution.reduce((sum, c) => sum + c.count, 0);

  const enforcementStats = {
    totalWrits: writs.length,
    pendingService: writs.filter(w => w.serviceStatus === 'pending').length,
    served: writs.filter(w => w.serviceStatus === 'served').length,
    totalAttempts: writs.reduce((sum, w) => sum + w.serviceAttempts.length, 0),
    avgAttemptsPerWrit: writs.length > 0 ? (writs.reduce((sum, w) => sum + w.serviceAttempts.length, 0) / writs.length).toFixed(1) : 0,
    totalSeized: writs.reduce((sum, w) => sum + w.seizureItems.length, 0),
    seizedValue: writs.reduce((sum, w) => sum + w.seizureItems.reduce((s, i) => s + i.estimatedValue, 0), 0),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Reports</h1><p className="text-sm text-muted-foreground mt-0.5">Analytics and performance metrics</p></div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="cases">Cases</TabsTrigger><TabsTrigger value="enforcement">Enforcement</TabsTrigger><TabsTrigger value="finance">Finance</TabsTrigger></TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6">
              <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Active Cases</p><p className="text-3xl font-bold">{stats.totalActiveCases}</p></div><BarChart3 className="w-8 h-8 text-amber-500" /></div>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Avg Case Age</p><p className="text-3xl font-bold">{stats.averageCaseAge}</p><p className="text-xs text-muted-foreground">days</p></div><Clock className="w-8 h-8 text-sky-500" /></div>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Enforcement Rate</p><p className="text-3xl font-bold">{stats.enforcementCompletionRate}%</p></div><CheckCircle2 className="w-8 h-8 text-emerald-500" /></div>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Monthly Revenue</p><p className="text-2xl font-bold">{formatCurrency(stats.revenueThisMonth)}</p></div><DollarSign className="w-8 h-8 text-teal-500" /></div>
            </CardContent></Card>
          </div>

          {/* Bottlenecks */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Process Bottlenecks</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topBottlenecks.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">{item.stage}</span><span className="text-sm text-muted-foreground">{item.count} cases ({item.avgDays} avg days)</span></div>
                    <Progress value={(item.count / Math.max(...stats.topBottlenecks.map(b => b.count))) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" />Monthly Case Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-4">
                {stats.monthlyTrend.map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="h-32 flex flex-col justify-end gap-1 mb-2">
                      <div className="bg-amber-400 rounded-t" style={{ height: `${(item.filed / 30) * 100}%` }} title={`Filed: ${item.filed}`} />
                      <div className="bg-emerald-400 rounded-b" style={{ height: `${(item.closed / 30) * 100}%` }} title={`Closed: ${item.closed}`} />
                    </div>
                    <p className="text-xs font-medium">{item.month}</p>
                    <p className="text-[10px] text-muted-foreground">{item.filed}F / {item.closed}C</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-xs"><div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-400" /><span>Filed</span></div><div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-400" /><span>Closed</span></div></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cases by Type */}
            <Card>
              <CardHeader><CardTitle className="text-base">Cases by Type</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.casesByType.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1"><span className="text-sm capitalize">{item.type}</span><span className="font-medium">{item.count}</span></div>
                      <Progress value={(item.count / Math.max(...stats.casesByType.map(c => c.count))) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cases by Age */}
            <Card>
              <CardHeader><CardTitle className="text-base">Cases by Age Bracket</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseAgeDistribution.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1"><span className="text-sm">{item.label}</span><span className="font-medium">{item.count} ({((item.count / totalCasesByAge) * 100).toFixed(0)}%)</span></div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(item.count / Math.max(...caseAgeDistribution.map(c => c.count))) * 100}%`, backgroundColor: item.color }} /></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Case Status */}
            <Card>
              <CardHeader><CardTitle className="text-base">Cases by Status</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[{ status: 'Active', count: cases.filter(c => c.status === 'active').length, color: 'emerald' },
                    { status: 'Pending', count: cases.filter(c => c.status === 'pending').length, color: 'amber' },
                    { status: 'Filed', count: cases.filter(c => c.status === 'filed').length, color: 'sky' },
                    { status: 'Closed', count: cases.filter(c => c.status === 'closed').length, color: 'slate' }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-lg bg-${item.color}-50 text-center`}>
                      <p className={`text-2xl font-bold text-${item.color}-700`}>{item.count}</p>
                      <p className="text-sm text-muted-foreground">{item.status}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hearings Summary */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4" />Hearing Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-lg bg-muted/50"><span>Scheduled</span><Badge>{hearings.filter(h => h.status === 'scheduled').length}</Badge></div>
                  <div className="flex justify-between p-3 rounded-lg bg-muted/50"><span>Completed</span><Badge variant="secondary">{hearings.filter(h => h.status === 'completed').length}</Badge></div>
                  <div className="flex justify-between p-3 rounded-lg bg-muted/50"><span>Adjourned</span><Badge variant="outline">{hearings.filter(h => h.status === 'adjourned').length}</Badge></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enforcement" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Writs</p><p className="text-3xl font-bold">{enforcementStats.totalWrits}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Pending Service</p><p className="text-3xl font-bold">{enforcementStats.pendingService}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Successfully Served</p><p className="text-3xl font-bold">{enforcementStats.served}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Avg Attempts/Writ</p><p className="text-3xl font-bold">{enforcementStats.avgAttemptsPerWrit}</p></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4" />Seizure Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Items Seized</p><p className="text-2xl font-bold">{enforcementStats.totalSeized}</p></div>
                  <div className="p-4 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Estimated Value</p><p className="text-2xl font-bold">{formatCurrency(enforcementStats.seizedValue)}</p></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Service Outcomes</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['served', 'not_found', 'refused', 'address_incorrect'].map(outcome => {
                    const count = writs.reduce((sum, w) => sum + w.serviceAttempts.filter(a => a.outcome === outcome).length, 0);
                    return (
                      <div key={outcome} className="flex justify-between p-3 rounded-lg bg-muted/50">
                        <span className="capitalize">{outcome.replace('_', ' ')}</span><Badge variant="outline">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Revenue This Month</p><p className="text-2xl font-bold">{formatCurrency(stats.revenueThisMonth)}</p><p className="text-xs text-emerald-600">+{(((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100).toFixed(1)}% vs last month</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Enforcement Fees Charged</p><p className="text-2xl font-bold">{formatCurrency(writs.reduce((sum, w) => sum + w.totalFeesCharged, 0))}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Enforcement Fees Collected</p><p className="text-2xl font-bold">{formatCurrency(writs.reduce((sum, w) => sum + w.totalFeesCollected, 0))}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Fee Collection by Writ</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {writs.map(writ => (
                  <div key={writ.id}>
                    <div className="flex items-center justify-between mb-1"><span className="text-sm font-mono">{writ.writNumber}</span><span className="text-sm">{formatCurrency(writ.totalFeesCollected)} / {formatCurrency(writ.totalFeesCharged)}</span></div>
                    <Progress value={writ.totalFeesCharged > 0 ? (writ.totalFeesCollected / writ.totalFeesCharged) * 100 : 0} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
