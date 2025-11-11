import { redirect } from 'next/navigation';
import { getSession } from '@/app/lib/session';
import { Box } from '@mond-design-system/theme';
import { LoginForm } from '@/app/components/admin/LoginForm';

export default async function LoginPage() {
  // Check if user is already logged in
  const session = await getSession();

  if (session?.userId) {
    redirect('/admin');
  }

  return (
    <Box className="flex justify-center items-center h-screen">
      <LoginForm />
    </Box>
  );
}
