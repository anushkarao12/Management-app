import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSwitchToSignup: () => void;
}

export function LoginPage({ onSwitchToSignup }: Props) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'alex@company.io', password: 'password' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    if (!result.ok) {
      toast.error(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">TaskFlow</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 mb-6 text-sm">
            <p className="text-blue-700 dark:text-blue-300 font-medium">Demo credentials</p>
            <p className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">alex@company.io (admin) or sarah@company.io (member)</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.io"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-4">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="text-neutral-900 dark:text-white font-medium hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
