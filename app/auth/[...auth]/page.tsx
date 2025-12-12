import { AuthView } from '@neondatabase/neon-js/auth/react/ui';

export const dynamicParams = false;

export default async function AuthPage({ params }: { params: Promise<{ auth: string[] }> }) {
  const { auth } = await params;
  const path = auth?.[0] || 'sign-in';

  return (
    <div className="light" style={{colorScheme: "light"}}>
      <main className="container mx-auto flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
        <AuthView path={path} />
      </main>
    </div>
  );
}

