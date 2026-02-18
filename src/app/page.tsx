'use client';

import { useApp } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FolderOpen,
  Calendar,
  Shield,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  FileText,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { stats, cases, hearings, writs, currentUser } = useApp();

  const upcomingHearings = hearings
    .filter(h => h.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const recentCases = cases
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    .slice(0, 5);

  const pendingWrits = writs.filter(w => w.status === 'pending' || w.status === 'in_progress');

  const revenueChange = ((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100;

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-US')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const statCards = [
    { title: 'Active Cases', value: stats.totalActiveCases, icon: FolderOpen, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { title: 'Filed This Month', value: stats.casesFiledThisMonth, icon: FileText, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Pending Hearings', value: stats.pendingHearings, icon: Calendar, color: 'text-sky-600', bgColor: 'bg-sky-50' },
    { title: 'Enforcement Actions', value: stats.pendingEnforcement, icon: Shield, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  ];

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
    filed: 'bg-sky-100 text-sky-700 border-sky-200',
    urgent: 'bg-rose-100 text-rose-700 border-rose-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {currentUser?.name.split(' ')[0]}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bgColor)}>
                  <stat.icon className={cn('w-6 h-6', stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Second Row: Revenue, Completion Rate, Age Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Revenue This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.revenueThisMonth)}</p>
                <div className={cn('flex items-center gap-1 text-sm mt-1', revenueChange >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                  {revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{Math.abs(revenueChange).toFixed(1)}% from last month</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enforcement Completion Rate */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Enforcement Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-slate-900">{stats.enforcementCompletionRate}%</p>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <Progress value={stats.enforcementCompletionRate} className="h-2" />
              <p className="text-xs text-slate-500">Target: 85%</p>
            </div>
          </CardContent>
        </Card>

        {/* Average Case Age */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Average Case Age</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.averageCaseAge} days</p>
                <p className="text-sm text-slate-500 mt-1">Across all active cases</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row: Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cases by Age Bracket */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Cases by Age Bracket</CardTitle>
            <CardDescription>Distribution of active cases by duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.casesByAge.map((bracket) => (
                <div key={bracket.label} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-slate-600">{bracket.label}</div>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(bracket.count / 50) * 100}%`,
                        backgroundColor: bracket.color,
                      }}
                    />
                  </div>
                  <div className="w-8 text-sm font-medium text-slate-700 text-right">{bracket.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly Case Trend</CardTitle>
            <CardDescription>Cases filed vs closed over 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {stats.monthlyTrend.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end justify-center h-28">
                    <div
                      className="w-3 bg-amber-400 rounded-t transition-all duration-500"
                      style={{ height: `${(month.filed / 30) * 100}%` }}
                      title={`Filed: ${month.filed}`}
                    />
                    <div
                      className="w-3 bg-emerald-400 rounded-t transition-all duration-500"
                      style={{ height: `${(month.closed / 30) * 100}%` }}
                      title={`Closed: ${month.closed}`}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-400" />
                <span className="text-slate-600">Filed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-400" />
                <span className="text-slate-600">Closed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fourth Row: Upcoming Hearings, Recent Cases, Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Hearings */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Upcoming Hearings</CardTitle>
              <Badge variant="secondary" className="text-xs">{upcomingHearings.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {upcomingHearings.map((hearing) => (
                  <div key={hearing.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{hearing.caseNumber}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{hearing.caseTitle}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                        {hearing.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(hearing.date)}
                      </span>
                      <span>{hearing.time}</span>
                      <span className="text-slate-400">|</span>
                      <span>{hearing.court}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Cases */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Cases</CardTitle>
              <Badge variant="secondary" className="text-xs">{cases.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {recentCases.map((caseItem) => (
                  <div key={caseItem.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{caseItem.caseNumber}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{caseItem.title}</p>
                      </div>
                      <Badge className={cn('shrink-0 text-[10px] capitalize border', statusColors[caseItem.status])}>
                        {caseItem.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={cn('text-[10px] capitalize', statusColors[caseItem.priority])}>
                        {caseItem.priority}
                      </Badge>
                      <span className="text-xs text-slate-400">{caseItem.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Top Bottlenecks */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Top Bottlenecks</CardTitle>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <CardDescription>Stages causing the most delays</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {stats.topBottlenecks.map((bottleneck, idx) => (
                <div key={bottleneck.stage} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{bottleneck.stage}</p>
                    <p className="text-xs text-slate-500">{bottleneck.count} cases | Avg: {bottleneck.avgDays} days</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cases by Type */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Cases by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.casesByType.map((item) => (
              <div key={item.type} className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-bold text-slate-900">{item.count}</p>
                <p className="text-sm text-slate-500 capitalize mt-1">{item.type}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
