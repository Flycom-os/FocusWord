// client/app/admin/settings/email/page.tsx
import React from 'react';
import EmailProviderList from './components/EmailProviderList';

import EmailTemplatesList from './components/EmailTemplatesList';

const EmailSettingsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Email Settings</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Email Providers</h2>
        <p className="text-gray-600 mb-4">
          Configure different email service providers for sending emails.
        </p>
        <EmailProviderList />
      </div>

      <EmailTemplatesList />
    </div>
  );
};

export default EmailSettingsPage;
