'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AdminPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Редирект на главную admin страницу
    router.push('/admin');
  }, [router]);

  return (
    <div className="text-center py-12">
      <p>Redirecting to admin...</p>
    </div>
  );
};

export default AdminPage;
