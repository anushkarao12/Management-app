import { useState } from 'react';
import { User, Bell, Palette, Shield, Moon, Sun } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/context/theme';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
];

export function Settings() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useState('profile');

  const handleSave = () => {
    toast.success('Settings saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Settings</h2>
        <p className="text-sm text-neutral-500">Manage your account preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <nav className="md:w-48 flex md:flex-col gap-1 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.id
                    ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                    : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1">
          {tab === 'profile' && user && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-medium text-neutral-900 dark:text-white">Profile Information</h3>

                <div className="flex items-center gap-4">
                  <Avatar name={user.name} size="lg" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-neutral-500">{user.email}</p>
                    <Badge variant="secondary" className="mt-1">{user.role}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Name" defaultValue={user.name} />
                  <Input label="Email" type="email" defaultValue={user.email} />
                </div>

                <Button onClick={handleSave}>Save changes</Button>
              </CardContent>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-medium text-neutral-900 dark:text-white">Notification Preferences</h3>

                {[
                  { label: 'Email notifications', desc: 'Receive task assignment emails' },
                  { label: 'Task reminders', desc: 'Get deadline reminders' },
                  { label: 'Project updates', desc: 'Notifications on project changes' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-neutral-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                      <div className="w-9 h-5 bg-neutral-300 dark:bg-neutral-700 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                  </div>
                ))}

                <Button onClick={handleSave}>Save preferences</Button>
              </CardContent>
            </Card>
          )}

          {tab === 'appearance' && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-medium text-neutral-900 dark:text-white">Appearance</h3>

                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Theme</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => theme !== 'light' && toggle()}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <Sun size={20} className="mx-auto mb-2 text-amber-500" />
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Light</p>
                    </button>
                    <button
                      onClick={() => theme !== 'dark' && toggle()}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <Moon size={20} className="mx-auto mb-2 text-indigo-500" />
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Dark</p>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === 'security' && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="font-medium text-neutral-900 dark:text-white">Security</h3>

                <div className="space-y-4 max-w-sm">
                  <Input type="password" label="Current password" />
                  <Input type="password" label="New password" />
                  <Input type="password" label="Confirm password" />
                  <Button onClick={handleSave}>Update password</Button>
                </div>

                <hr className="border-neutral-200 dark:border-neutral-800" />

                <div>
                  <h4 className="text-sm font-medium text-red-600 mb-2">Danger zone</h4>
                  <p className="text-sm text-neutral-500 mb-3">Permanently delete your account</p>
                  <Button variant="destructive" onClick={() => toast.error('Not available in demo')}>
                    Delete account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
