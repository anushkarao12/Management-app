import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/auth';
import { ThemeProvider } from '@/context/theme';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { Tasks } from '@/pages/Tasks';
import { Team } from '@/pages/Team';
import { Settings } from '@/pages/Settings';
import { Spinner } from '@/components/ui/Spinner';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Overview',
  projects: 'Projects',
  tasks: 'Tasks',
  team: 'Team',
  settings: 'Settings',
};

function AppContent() {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return authView === 'login' 
      ? <LoginPage onSwitchToSignup={() => setAuthView('signup')} />
      : <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <Projects />;
      case 'tasks': return <Tasks />;
      case 'team': return <Team />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="lg:ml-60">
        <Header
          title={PAGE_TITLES[page] || 'TaskFlow'}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-4 lg:p-6 max-w-6xl">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '8px', fontSize: '14px' },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
