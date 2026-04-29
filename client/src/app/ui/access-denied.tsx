'use client';

import React from 'react';
import { Shield, Home, ArrowLeft } from 'lucide-react';
import Button from '@/src/shared/ui/Button/ui-button';
import { useRouter } from 'next/navigation';

const AccessDenied = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Доступ запрещен
        </h1>
        
        <p className="text-gray-600 mb-6">
          У вас нет прав доступа к этой странице. Пожалуйста, обратитесь к администратору для получения необходимых разрешений.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            theme="primary" 
            onClick={() => router.push('/admin')}
            className="flex items-center justify-center gap-2"
          >
            <Home size={16} />
            На главную
          </Button>
          
          <Button 
            theme="secondary" 
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Назад
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
