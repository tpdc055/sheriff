'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, Case, Hearing, Order, Writ, AuditLog } from './types';
import { demoUsers, demoCases, demoHearings, demoOrders, demoWrits, demoAuditLogs, dashboardStats } from './mock-data';

interface AppState {
  currentUser: User | null;
  users: User[];
  cases: Case[];
  hearings: Hearing[];
  orders: Order[];
  writs: Writ[];
  auditLogs: AuditLog[];
  stats: typeof dashboardStats;
  setCurrentUser: (user: User | null) => void;
  addCase: (c: Case) => void;
  updateCase: (id: string, updates: Partial<Case>) => void;
  addHearing: (h: Hearing) => void;
  addOrder: (o: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  addWrit: (w: Writ) => void;
  updateWrit: (id: string, updates: Partial<Writ>) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(demoUsers[0]);
  const [users] = useState<User[]>(demoUsers);
  const [cases, setCases] = useState<Case[]>(demoCases);
  const [hearings, setHearings] = useState<Hearing[]>(demoHearings);
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [writs, setWrits] = useState<Writ[]>(demoWrits);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(demoAuditLogs);
  const [stats] = useState(dashboardStats);

  const addCase = (c: Case) => setCases(prev => [...prev, c]);
  const updateCase = (id: string, updates: Partial<Case>) =>
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

  const addHearing = (h: Hearing) => setHearings(prev => [...prev, h]);

  const addOrder = (o: Order) => setOrders(prev => [...prev, o]);
  const updateOrder = (id: string, updates: Partial<Order>) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));

  const addWrit = (w: Writ) => setWrits(prev => [...prev, w]);
  const updateWrit = (id: string, updates: Partial<Writ>) =>
    setWrits(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const resetDemo = () => {
    setCases(demoCases);
    setHearings(demoHearings);
    setOrders(demoOrders);
    setWrits(demoWrits);
    setAuditLogs(demoAuditLogs);
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, cases, hearings, orders, writs, auditLogs, stats,
      setCurrentUser, addCase, updateCase, addHearing, addOrder, updateOrder,
      addWrit, updateWrit, addAuditLog, resetDemo,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
