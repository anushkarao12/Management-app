import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/auth';
import { ThemeProvider } from '@/context/theme';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Spinner } from '@/components/ui/Spinner';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { Tasks } from '@/pages/Tasks';
import { Team } from '@/pages/Team';
import { Settings } from '@/pages/Settings';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return authPage === 'login'
      ? <LoginPage onSwitchToSignup={() => setAuthPage('signup')} />
      : <SignupPage onSwitchToLogin={() => setAuthPage('login')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <Projects />;
      case 'tasks': return <Tasks />;
      case 'team': return <Team />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="md:ml-56">
        <Header onMenuClick={openSidebar} />
        <main className="p-4 md:p-6">
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
        <Toaster position="bottom-right" toastOptions={{
          className: 'text-sm',
          duration: 3000,
        }} />
      </AuthProvider>
    </ThemeProvider>
  );
}
