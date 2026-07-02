// client/app/admin/settings/email/components/EmailTemplatesList.tsx
"use client";

import React, { useState, useEffect } from 'react';
import AddEditEmailTemplateModal from './AddEditEmailTemplateModal';

const apiClient = {
  get: (url) => fetch(`http://localhost:3001/api${url}`).then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  }),
  delete: (url) => fetch(`http://localhost:3001/api${url}`, { method: 'DELETE' }).then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
  }),
};

const EmailTemplatesList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<any | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/email-templates');
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch email templates.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await apiClient.delete(`/email-templates/${id}`);
        fetchTemplates(); // Refresh the list
      } catch (err) {
        setError('Failed to delete template.');
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <div className="bg-white shadow rounded-lg mt-8">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-medium">Email Templates</h3>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={() => { setTemplateToEdit(null); setIsModalOpen(true); }}
          >
            Add Template
          </button>
        </div>
        <div className="p-4">
          {templates.length === 0 ? (
            <p>No email templates configured yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {templates.map((template: any) => (
                <li key={template.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{template.name}</p>
                    <p className="text-sm text-gray-500">{template.subject}</p>
                  </div>
                  <div className="space-x-2">
                    <button 
                      className="text-sm text-blue-500 hover:underline"
                      onClick={() => { setTemplateToEdit(template); setIsModalOpen(true); }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(template.id)}
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
      <AddEditEmailTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { fetchTemplates(); setIsModalOpen(false); }}
        templateToEdit={templateToEdit}
      />
    </>
  );
};

export default EmailTemplatesList;
