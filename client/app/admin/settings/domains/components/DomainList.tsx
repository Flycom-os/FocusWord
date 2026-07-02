// client/app/admin/settings/domains/components/DomainList.tsx
"use client";

import React, { useState, useEffect } from 'react';
import AddDomainModal from './AddDomainModal';
import DomainVerificationModal from './DomainVerificationModal';

const apiClient = {
  get: (url) => fetch(`http://localhost:3001/api${url}`).then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  }),
  delete: (url) => fetch(`http://localhost:3001/api${url}`, { method: 'DELETE' }).then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
  }),
  post: (url) => fetch(`http://localhost:3001/api${url}`, { method: 'POST' }).then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
  }),
};

const DomainList = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [domainToVerify, setDomainToVerify] = useState<any | null>(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/domains');
      setDomains(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch domains.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this domain?')) {
      try {
        await apiClient.delete(`/domains/${id}`);
        fetchDomains(); // Refresh the list
      } catch (err) {
        setError('Failed to delete domain.');
        console.error(err);
      }
    }
  };
  
  const handleCheckDns = async (id: number) => {
    try {
      await apiClient.post(`/domains/${id}/check-dns`);
      fetchDomains(); // Refresh the list
    } catch (err) {
      setError('Failed to check DNS.');
      console.error(err);
    }
  };
  
  const handleOpenVerifyModal = (domain: any) => {
    setDomainToVerify(domain);
    setIsVerifyModalOpen(true);
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-medium">Configured Domains</h3>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Domain
          </button>
        </div>
        <div className="p-4">
          {domains.length === 0 ? (
            <p>No domains configured yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {domains.map((domain: any) => (
                <li key={domain.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{domain.name}</p>
                    <p className="text-sm text-gray-500">
                      Status: {domain.status} - {domain.isVerified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                  <div className="space-x-2">
                    {!domain.isVerified && (
                      <button 
                        className="text-sm text-blue-500 hover:underline"
                        onClick={() => handleOpenVerifyModal(domain)}
                      >
                        Verify
                      </button>
                    )}
                    <button 
                      className="text-sm text-gray-500 hover:underline"
                      onClick={() => handleCheckDns(domain.id)}
                    >
                      Check DNS
                    </button>
                    <button 
                      onClick={() => handleDelete(domain.id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <AddDomainModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => { fetchDomains(); setIsAddModalOpen(false); }}
      />
      <DomainVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onSuccess={() => { fetchDomains(); setIsVerifyModalOpen(false); }}
        domain={domainToVerify}
      />
    </>
  );
};

export default DomainList;
