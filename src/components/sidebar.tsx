'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import { rolePermissions } from '@/lib/types';
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  FileText,
  Shield,
  ScrollText,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Scale,
  ChevronDown,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { demoUsers } from '@/lib/mock-data';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Cases', href: '/cases', icon: FolderOpen },
  { name: 'Scheduling', href: '/scheduling', icon: Calendar },
  { name: 'Orders', href: '/orders', icon: FileText },
  { name: 'Enforcement', href: '/enforcement', icon: Shield, permission: 'canManageEnforcement' as const },
  { name: 'Audit Log', href: '/audit', icon: ScrollText, permission: 'canViewAuditLog' as const },
  { name: 'Reports', href: '/reports', icon: BarChart3, permission: 'canViewReports' as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, setCurrentUser, resetDemo } = useApp();

  if (!currentUser) return null;

  const permissions = rolePermissions[currentUser.role];
  const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const filteredNav = navigation.filter(item => {
    if (!item.permission) return true;
    return permissions[item.permission];
  });

  const roleColors: Record<string, string> = {
    registrar: 'bg-amber-600',
    registry: 'bg-emerald-600',
    judge: 'bg-rose-700',
    associate: 'bg-sky-600',
    sheriff: 'bg-slate-700',
    finance: 'bg-teal-600',
    admin: 'bg-violet-600',
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-700/50">
        <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
          <Scale className="w-5 h-5 text-slate-900" />
        </div>
        <div>
          <h1 className="font-semibold text-sm tracking-tight">Court CMS</h1>
          <p className="text-[10px] text-slate-400 tracking-wide uppercase">Prototype v1.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredNav.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-amber-400')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Demo Reset */}
      {permissions.canResetDemo && (
        <div className="px-3 py-2">
          <button
            onClick={resetDemo}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            Reset Demo Data
          </button>
        </div>
      )}

      {/* User Menu */}
      <div className="p-3 border-t border-slate-700/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarFallback className={cn('text-white text-xs font-semibold', roleColors[currentUser.role])}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {demoUsers.map(user => (
              <DropdownMenuItem
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className={cn(currentUser.id === user.id && 'bg-accent')}
              >
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', roleColors[user.role])} />
                  <span>{user.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground capitalize">({user.role})</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
