/**
 * Purpose: Login page — authenticates via AuthContext (currently mocked, no auth API exists yet)
 * Responsibilities: Simple email/password form; on submit, logs in the mock user and redirects
 * NOTE: No login wireframe was provided in the BRD/wireframe set — this is a minimal functional
 *       placeholder. Flag if you have a specific login design to match.
 * Dependencies: react-hook-form, zod, Input, Button, AuthContext, react-router-dom
 * Export: LoginPage (default)
 */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../routes/routePaths';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async () => {
    // TODO: replace with real authService.login() call once the backend is connected
    login({ id: 'usr_001', name: 'Ajith Kumar', role: 'Admin', email: 'ajith@shinecrafttech.com' });
    const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? ROUTES.DASHBOARD;
    navigate(redirectTo, { replace: true });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Sign in</h2>
        <p className="mt-0.5 text-sm text-ink-500">Enter your credentials to access your account.</p>
      </div>

      <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />
      <Input label="Password" type="password" required error={errors.password?.message} {...register('password')} />

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Sign In
      </Button>
    </form>
  );
}
