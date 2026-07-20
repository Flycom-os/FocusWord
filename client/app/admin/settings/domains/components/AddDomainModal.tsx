// client/app/admin/settings/domains/components/AddDomainModal.tsx

"use client";

import React, { useState } from "react";
import Modal from "../../email/components/Modal"; // Re-using the generic modal
import { DnsProviderType } from "./domain-enums";

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
};

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddDomainModal: React.FC<AddDomainModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [dnsProviderType, setDnsProviderType] = useState<DnsProviderType | "">("");
  const [dnsProviderCredentials, setDnsProviderCredentials] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: any = { name };
    if (dnsProviderType) {
      payload.dnsProviderType = dnsProviderType;
      payload.dnsProviderCredentials = dnsProviderCredentials;
    }

    try {
      await apiClient.post("/domains", payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add domain.");
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDnsProviderCredentials({
      ...dnsProviderCredentials,
      [e.target.name]: e.target.value,
    });
  };

  const renderCloudflareFields = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">Cloudflare API Token</label>
      <input
        type="password"
        name="apiToken"
        value={dnsProviderCredentials.apiToken || ""}
        onChange={handleCredentialsChange}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
      />
    </div>
  );

  const renderRoute53Fields = () => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">AWS Access Key ID</label>
        <input
          type="text"
          name="accessKeyId"
          value={dnsProviderCredentials.accessKeyId || ""}
          onChange={handleCredentialsChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">AWS Secret Access Key</label>
        <input
          type="password"
          name="secretAccessKey"
          value={dnsProviderCredentials.secretAccessKey || ""}
          onChange={handleCredentialsChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Domain">
      <form onSubmit={handleSubmit}>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Domain Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
            placeholder="example.com"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            DNS Provider (Optional for automated setup)
          </label>
          <select
            value={dnsProviderType}
            onChange={(e) => {
              setDnsProviderType(e.target.value as DnsProviderType);
              setDnsProviderCredentials({});
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Manual Setup</option>
            {Object.values(DnsProviderType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {dnsProviderType === DnsProviderType.CLOUDFLARE && renderCloudflareFields()}
        {dnsProviderType === DnsProviderType.ROUTE53 && renderRoute53Fields()}

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
            {loading ? "Adding..." : "Add Domain"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddDomainModal;
