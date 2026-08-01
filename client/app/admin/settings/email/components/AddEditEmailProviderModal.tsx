// client/app/admin/settings/email/components/AddEditEmailProviderModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { EmailProviderType } from "@/app/admin/settings/email/components/email-provider-enums"; // Assuming you have this enum on the frontend
import Modal from "./Modal";

const apiClient = {
  post: (url, data) =>
    fetch(`http://localhost:3001/api${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    }),
  patch: (url, data) =>
    fetch(`http://localhost:3001/api${url}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    }),
};

interface AddEditEmailProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // To refresh the list
  providerToEdit: any | null;
}

const AddEditEmailProviderModal: React.FC<AddEditEmailProviderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  providerToEdit,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<EmailProviderType>(EmailProviderType.SMTP);
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (providerToEdit) {
      setName(providerToEdit.name);
      setType(providerToEdit.type);
      setIsActive(providerToEdit.isActive);
      setIsDefault(providerToEdit.isDefault);
      setSettings(providerToEdit.settings || {});
    } else {
      // Reset form
      setName("");
      setType(EmailProviderType.SMTP);
      setIsActive(true);
      setIsDefault(false);
      setSettings({});
    }
  }, [providerToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { name, type, isActive, isDefault, settings };

    try {
      if (providerToEdit) {
        await apiClient.patch(`/email-providers/${providerToEdit.id}`, payload);
      } else {
        await apiClient.post("/email-providers", payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save provider.");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const renderSmtpFields = () => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
        <input
          type="text"
          name="host"
          value={settings.host || ""}
          onChange={handleSettingsChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
        <input
          type="number"
          name="port"
          value={settings.port || ""}
          onChange={handleSettingsChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">SMTP User</label>
        <input
          type="text"
          name="auth_user"
          value={settings.auth_user || ""}
          onChange={handleSettingsChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">SMTP Password</label>
        <input
          type="password"
          name="auth_pass"
          value={settings.auth_pass || ""}
          onChange={handleSettingsChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          required
        />
      </div>
    </>
  );

  const renderSendGridFields = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">SendGrid API Key</label>
      <input
        type="password"
        name="apiKey"
        value={settings.apiKey || ""}
        onChange={handleSettingsChange}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        required
      />
    </div>
  );

  // You can add more render functions for other provider types (Mailgun, AWS SES)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={providerToEdit ? "Edit Provider" : "Add Provider"}
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Provider Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Provider Type</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as EmailProviderType);
              setSettings({}); // Reset settings when type changes
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            {Object.values(EmailProviderType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {type === EmailProviderType.SMTP && renderSmtpFields()}
        {type === EmailProviderType.SENDGRID && renderSendGridFields()}
        {/* Render fields for other types here */}

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Is Active</label>
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Is Default Provider</label>
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
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditEmailProviderModal;
