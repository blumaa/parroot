'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@mond-design-system/theme';
import { Input } from '@mond-design-system/theme/client';
import { signInUser } from '@/app/utils/auth';
import { useToast } from '@/app/providers/ToastProvider';
import { createSessionFromCredentials } from '@/app/actions/auth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInUser(email, password);

      // Get the ID token from Firebase
      const idToken = await userCredential.user.getIdToken();

      // Send ID token to server for verification and session creation
      const result = await createSessionFromCredentials(idToken);

      if (!result.success) {
        showError('Login Failed', result.error || 'An error occurred');
        return;
      }

      showSuccess('Login Successful', 'Welcome back!');
      router.push('/admin');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      showError('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
      />
      <Button type="submit" variant="primary" loading={isLoading}>
        Login
      </Button>
    </form>
  );
}
