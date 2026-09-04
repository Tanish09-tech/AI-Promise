import React, { useState } from 'react';
import {
  Calendar,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Clock,
  FileCheck,
  ShieldAlert,
  CheckCircle2,
  PieChart as PieIcon,
  ChevronRight,
  Plus,
  CreditCard,
  RotateCw,
  Download,
  Lightbulb,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CommitEngine } from '../../services/engine';

interface OverviewProps {
  engine: CommitEngine;
  onNavigate: (tab: any) => void;
  onRunBatch: () => void;
  onOpenGuidedTour: () => void;
  onShowToast: (type: 'success' | 'warning' | 'info', title: string, message: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ engine: _engine, onNavigate, onOpenGuidedTour, onShowToast }) => {

  const [trendRange, setTrendRange] = useState('This Week');

  // Trend Chart Data
  const trendData = [
    { date: 'Aug 30', amount: 150000 },
    { date: 'Aug 31', amount: 210000 },
    { date: 'Sep 1', amount: 180000 },
    { date: 'Sep 2', amount: 205000 },
    { date: 'Sep 3', amount: 175000 },
    { date: 'Sep 4', amount: 195000 },
    { date: 'Sep 5', amount: 285000 }
  ];

  // Donut Chart Data
  const donutData = [
    { name: 'Active', value: 58, percentage: '37%', color: '#2563eb' },
    { name: 'Fulfilled', value: 42, percentage: '27%', color: '#10b981' },
    { name: 'Partially Fulfilled', value: 31, percentage: '20%', color: '#f59e0b' },
    { name: 'Broken', value: 43, percentage: '16%', color: '#ef4444' }
  ];

  // Top At Risk Invoices Data
  const atRiskInvoices = [
    { id: 'INV-1001', customer: 'ABC Traders', amount: '₹20,000', dueDate: 'Aug 28, 2024', daysOverdue: 8, riskScore: 'High', riskColor: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30' },
    { id: 'INV-1002', customer: 'XYZ Pvt Ltd', amount: '₹18,500', dueDate: 'Aug 26, 2024', daysOverdue: 10, riskScore: 'High', riskColor: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30' },
    { id: 'INV-1003', customer: 'Global Supplies', amount: '₹15,000', dueDate: 'Aug 25, 2024', daysOverdue: 11, riskScore: 'Medium', riskColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' },
    { id: 'INV-1004', customer: 'KLM Enterprises', amount: '₹12,000', dueDate: 'Aug 24, 2024', daysOverdue: 12, riskScore: 'Medium', riskColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' },
    { id: 'INV-1005', customer: 'Precision Tools', amount: '₹11,000', dueDate: 'Aug 23, 2024', daysOverdue: 13, riskScore: 'Low', riskColor: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' }
  ];

  // Recent Commitments Data
  const recentCommitments = [
    {
      id: 'INV-1001',
      customer: 'ABC Traders',
      note: "I'll pay ₹30,000 tomorrow and the remaining ₹20,000 by Friday.",
      amount: '₹30,000',
      type: 'Paid',
      status: 'Partially Fulfilled',
      statusColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
      dueDate: 'Due: Sep 6, 2024'
    },
    {
      id: 'INV-1007',
      customer: 'Shri Traders',
      note: 'Will clear the pending amount by Monday.',
      amount: '₹9,800',
      type: 'Due',
      status: 'Active',
      statusColor: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
      dueDate: 'Due: Sep 9, 2024'
    },
    {
      id: 'INV-1003',
      customer: 'Global Supplies',
      note: 'I will try to pay next week.',
      amount: '₹15,000',
      type: 'Due',
      status: 'Broken',
      statusColor: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30',
      dueDate: 'Due: Sep 4, 2024'
    },
    {
      id: 'INV-1009',
      customer: 'Future Tech',
      note: 'Part payment by Monday and rest by month end.',
      amount: '₹25,000',
      type: 'Paid',
      status: 'Partially Fulfilled',
      statusColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
      dueDate: 'Due: Sep 10, 2024'
    },
    {
      id: 'INV-1012',
      customer: 'Delta Corp',
      note: 'I can pay half tomorrow.',
      amount: '₹14,250',
      type: 'Due',
      status: 'Needs Review',
      statusColor: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
      dueDate: 'Due: -'
    }
  ];

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      {/* 1. Greeting & Date Range Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Good morning, Arjun! 👋
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Here's your revenue recovery overview for today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Aug 30 – Sep 5, 2024</span>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition cursor-pointer">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Cards Row (6 Metric Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* Metric 1 */}
        <div className="commit-card p-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            REVENUE AT RISK
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
            ₹12,40,000
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400">
            <ArrowUp className="w-3 h-3" />
            <span>12.5% vs last week</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="commit-card p-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            PROMISED AMOUNT
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
            ₹8,70,000
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
            <ArrowUp className="w-3 h-3" />
            <span>8.2% vs last week</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="commit-card p-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            VERIFIED PAYMENTS
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
            ₹5,20,000
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUp className="w-3 h-3" />
            <span>18.7% vs last week</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="commit-card p-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            AGENT RECOVERED
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
            ₹2,15,000
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
            <ArrowUp className="w-3 h-3" />
            <span>23.4% vs last week</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="commit-card p-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            ACTIVE COMMITMENTS
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
            156
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            <ArrowUp className="w-3 h-3" />
            <span>6.8% vs last week</span>
          </div>
        </div>

        {/* Metric 6 */}
        <div className="commit-card p-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            BROKEN COMMITMENTS
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">
            43
          </div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400">
            <ArrowDown className="w-3 h-3" />
            <span>9.1% vs last week</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Recovery Pipeline & Recovery Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recovery Pipeline (7 Columns on LG) */}
        <div className="lg:col-span-7 commit-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recovery Pipeline
          </h3>

          <div className="grid grid-cols-5 gap-2 text-center pt-2">
            {/* Step 1: Overdue */}
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Overdue</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">156 Invoices</div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-white font-mono">₹12,40,000</div>
            </div>

            {/* Step 2: Promise Captured */}
            <div className="space-y-2 relative">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Promise Captured</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">73 Invoices</div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-white font-mono">₹8,70,000</div>
            </div>

            {/* Step 3: Commitments Active */}
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Commitments Active</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">58 Invoices</div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-white font-mono">₹7,60,000</div>
            </div>

            {/* Step 4: Payments Received */}
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Payments Received</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">42 Invoices</div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-white font-mono">₹5,20,000</div>
            </div>

            {/* Step 5: Recovered */}
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <PieIcon className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Recovered</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">28 Invoices</div>
              <div className="text-[11px] font-bold text-slate-900 dark:text-white font-mono">₹2,15,000</div>
            </div>
          </div>
        </div>

        {/* Recovery Trend Chart (5 Columns on LG) */}
        <div className="lg:col-span-5 commit-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recovery Trend
            </h3>
            <select
              value={trendRange}
              onChange={e => setTrendRange(e.target.value)}
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={val => `₹${val / 100000}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Recovered']}
                />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#purpleGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Third Row: Top At Risk Invoices, AI Insights, Commitment Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top At Risk Invoices Table (5 Columns on LG) */}
        <div className="lg:col-span-5 commit-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Top At Risk Invoices
            </h3>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-400 font-mono uppercase border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="pb-2">Invoice ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Outstanding</th>
                  <th className="pb-2">Due Date</th>
                  <th className="pb-2">Days Overdue</th>
                  <th className="pb-2 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {atRiskInvoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300 font-bold">{inv.id}</td>
                    <td className="py-2.5 font-semibold text-slate-900 dark:text-white">{inv.customer}</td>
                    <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">{inv.amount}</td>
                    <td className="py-2.5 text-slate-500 font-mono text-[11px]">{inv.dueDate}</td>
                    <td className="py-2.5 font-mono text-center">{inv.daysOverdue}</td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${inv.riskColor}`}>
                        {inv.riskScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights (4 Columns on LG) */}
        <div className="lg:col-span-4 commit-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Insights
            </h3>
            <button
              onClick={() => onOpenGuidedTour()}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              View All Insights
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {/* Insight 1 */}
            <div className="flex items-start gap-3 p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-500/20 rounded-xl">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  You can recover ₹1,20,000 from 15 commitments that are likely to be fulfilled in the next 3 days.
                </p>
                <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-200/60 dark:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-mono">
                  High Impact
                </span>
              </div>
            </div>

            {/* Insight 2 */}
            <div className="flex items-start gap-3 p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-500/20 rounded-xl">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  8 customers have a high chance of defaulting on their commitments. Consider early action.
                </p>
                <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-blue-200/60 dark:bg-blue-500/30 text-blue-800 dark:text-blue-300 font-mono">
                  At Risk
                </span>
              </div>
            </div>

            {/* Insight 3 */}
            <div className="flex items-start gap-3 p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-500/20 rounded-xl">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  Reminder within 24 hrs of deadline has 68% higher payment success rate.
                </p>
                <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-amber-200/60 dark:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-mono">
                  Opportunity
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Commitment Status Donut (3 Columns on LG) */}
        <div className="lg:col-span-3 commit-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Commitment Status
          </h3>

          <div className="flex flex-col items-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any, name: any) => [`${val} (${donutData.find(d => d.name === name)?.percentage})`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-1.5 text-xs font-medium pt-2">
              {donutData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {item.value} ({item.percentage})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Fourth Row: Recent Commitments & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Commitments Table (8 Columns on LG) */}
        <div className="lg:col-span-8 commit-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Commitments
            </h3>
            <button
              onClick={() => onNavigate('commitments')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {recentCommitments.map((cmt, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('commitments')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer text-xs"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0">{cmt.id}</div>
                  <div className="w-28 font-bold text-slate-900 dark:text-white truncate shrink-0">{cmt.customer}</div>
                  <div className="text-slate-600 dark:text-slate-300 truncate font-medium max-w-xs">{cmt.note}</div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">{cmt.amount}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{cmt.type}</div>
                  </div>

                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${cmt.statusColor}`}>
                    {cmt.status}
                  </span>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">{cmt.dueDate}</div>

                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (4 Columns on LG) */}
        <div className="lg:col-span-4 commit-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Quick Actions
          </h3>

          <div className="space-y-2.5 pt-1">
            {/* Action 1: Add Customer Promise */}
            <button
              onClick={() => onNavigate('invoices')}
              className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition cursor-pointer text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                  Add Customer Promise
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Capture a new payment commitment
                </div>
              </div>
            </button>

            {/* Action 2: Add Payment */}
            <button
              onClick={() => onNavigate('invoices')}
              className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition cursor-pointer text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                  Add Payment
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Record a received payment
                </div>
              </div>
            </button>

            {/* Action 3: Run Recovery Evaluation */}
            <button
              onClick={() => onNavigate('decision_center')}
              className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition cursor-pointer text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <RotateCw className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:underline">
                  Run Recovery Evaluation
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Evaluate broken commitments
                </div>
              </div>
            </button>

            {/* Action 4: Export Report */}
            <button
              onClick={() => onShowToast('info', 'Export Triggered', 'Downloading PDF/CSV analytics report...')}
              className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition cursor-pointer text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:underline">
                  Export Report
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Download recovery analytics
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

