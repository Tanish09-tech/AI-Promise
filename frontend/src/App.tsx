import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import type { TabType } from './components/Sidebar';
import { Overview } from './components/Dashboard/Overview';
import { CustomerInbox } from './components/Inbox/CustomerInbox';
import { InvoiceList } from './components/Invoices/InvoiceList';
import { CommitmentTracker } from './components/Commitments/CommitmentTracker';
import { RecoveryMatrix } from './components/DecisionEngine/RecoveryMatrix';
import { ExceptionCenter } from './components/Exceptions/ExceptionCenter';
import { AuditViewer } from './components/AuditTrail/AuditViewer';
import { BatchRunner } from './components/BatchEvaluation/BatchRunner';
import { LiveSandbox } from './components/Simulator/LiveSandbox';
import { ToastContainer } from './components/Common/Toast';
import type { ToastMessage } from './components/Common/Toast';
import { GuidedDemoModal } from './components/Common/GuidedDemoModal';

import { engineInstance } from './services/engine';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentDate, setCurrentDate] = useState<string>(engineInstance.currentDate);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const [isSandboxOpen, setIsSandboxOpen] = useState<boolean>(false);
  const [isGuidedTourOpen, setIsGuidedTourOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [, setRefreshState] = useState<number>(0);

  const showToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message
    };
    setToasts(prev => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const forceRefresh = () => {
    setRefreshState(prev => prev + 1);
  };

  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
    engineInstance.setSimulatedDate(newDate);
    showToast('info', 'Simulated Date Updated', `Current system date set to ${newDate}.`);
    forceRefresh();
  };

  const handleReset = () => {
    engineInstance.resetToDefaults();
    setCurrentDate(engineInstance.currentDate);
    showToast('info', 'Simulation Reset', 'All commitments, payments, and audit logs reset to initial state.');
    forceRefresh();
  };

  const counts = {
    invoices: engineInstance.invoices.length,
    commitments: engineInstance.commitments.length,
    broken: engineInstance.commitments.filter(c => c.status === 'BROKEN').length,
    exceptions: engineInstance.exceptions.filter(e => e.status === 'NEEDS_REVIEW').length,
    audit: engineInstance.auditLogs.length
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans antialiased w-full max-w-full overflow-x-hidden ${isDarkMode ? 'dark bg-[#080c14] text-slate-100' : 'bg-[#f4f5f8] text-slate-900'}`}>
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        counts={counts}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Header
          currentDate={currentDate}
          onDateChange={handleDateChange}
          onReset={handleReset}
          onOpenSandbox={() => setIsSandboxOpen(true)}
          onOpenGuidedTour={() => setIsGuidedTourOpen(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(prev => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Overview
              engine={engineInstance}
              onNavigate={setActiveTab}
              onRunBatch={() => setActiveTab('batch_eval')}
              onOpenGuidedTour={() => setIsGuidedTourOpen(true)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'inbox' && (
            <CustomerInbox
              engine={engineInstance}
              onRefresh={forceRefresh}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceList
              engine={engineInstance}
              onRefresh={forceRefresh}
              onShowToast={showToast}
            />
          )}

          {(activeTab === 'commitments' || activeTab === 'decision_center') && (
            <CommitmentTracker
              engine={engineInstance}
              onRefresh={forceRefresh}
            />
          )}

          {activeTab === 'exceptions' && (
            <ExceptionCenter
              engine={engineInstance}
              onRefresh={forceRefresh}
            />
          )}

          {activeTab === 'audit' && (
            <AuditViewer
              engine={engineInstance}
            />
          )}

          {(activeTab === 'batch_eval' || activeTab === 'reports') && (
            <BatchRunner
              engine={engineInstance}
            />
          )}

          {activeTab === 'customers' && (
            <InvoiceList
              engine={engineInstance}
              onRefresh={forceRefresh}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <RecoveryMatrix
              engine={engineInstance}
              onRefresh={forceRefresh}
            />
          )}
        </main>
      </div>

      {isSandboxOpen && (
        <LiveSandbox
          engine={engineInstance}
          onClose={() => setIsSandboxOpen(false)}
          onRefresh={forceRefresh}
        />
      )}

      {isGuidedTourOpen && (
        <GuidedDemoModal
          engine={engineInstance}
          onClose={() => setIsGuidedTourOpen(false)}
          onRefresh={forceRefresh}
          onShowToast={showToast}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

export default App;

