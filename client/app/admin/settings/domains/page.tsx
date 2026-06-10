// client/app/admin/settings/domains/page.tsx
import React from 'react';
import DomainList from './components/DomainList';

const DomainManagementPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Domain Management</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Domains</h2>
        <p className="text-gray-600 mb-4">
          Configure domains for sending emails and verify their ownership.
        </p>
        <DomainList />
      </div>
    </div>
  );
};

export default DomainManagementPage;
