// client/app/admin/settings/email/components/AddEditEmailTemplateModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const apiClient = {
  post: (url, data) => fetch(`http://localhost:3001/api${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  }),
  patch: (url, data) => fetch(`http://localhost:3001/api${url}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  }),
};

interface AddEditEmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  templateToEdit: any | null;
}

const AddEditEmailTemplateModal: React.FC<AddEditEmailTemplateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  templateToEdit,
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (templateToEdit) {
      setName(templateToEdit.name);
      setSubject(templateToEdit.subject);
      setBodyHtml(templateToEdit.bodyHtml);
      setBodyText(templateToEdit.bodyText || '');
      setDescription(templateToEdit.description || '');
    } else {
      // Reset form
      setName('');
      setSubject('');
      setBodyHtml('');
      setBodyText('');
      setDescription('');
    }
  }, [templateToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { name, subject, bodyHtml, bodyText, description };

    try {
      if (templateToEdit) {
        await apiClient.patch(`/email-templates/${templateToEdit.id}`, payload);
      } else {
        await apiClient.post('/email-templates', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save template.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={templateToEdit ? 'Edit Template' : 'Add Template'}>
      <form onSubmit={handleSubmit}>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Template Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
            placeholder="e.g., welcome-email"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">HTML Body</label>
          <textarea
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows={8}
            placeholder="<p>Hello {{name}},</p>"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Text Body (Optional)</label>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows={4}
            placeholder="Hello {{name}},"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditEmailTemplateModal;
