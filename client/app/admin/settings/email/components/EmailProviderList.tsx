// client/app/admin/settings/email/components/EmailProviderList.tsx

"use client";

import React, { useState, useEffect } from "react";
import AddEditEmailProviderModal from "./AddEditEmailProviderModal";
import SendTestEmailModal from "./SendTestEmailModal";

// A mock API client. In a real app, this would be a proper service.
const apiClient = {
  get: (url) =>
    fetch(`http://localhost:3001/api${url}`).then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    }),
  delete: (url) =>
    fetch(`http://localhost:3001/api${url}`, { method: "DELETE" }).then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
    }),
};

const EmailProviderList = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [providerToEdit, setProviderToEdit] = useState<any | null>(null);

  const [isTestSendModalOpen, setIsTestSendModalOpen] = useState(false);
  const [providerIdForTestSend, setProviderIdForTestSend] = useState<number | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get("/email-providers");
      setProviders(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch email providers.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this provider?")) {
      try {
        await apiClient.delete(`/email-providers/${id}`);
        fetchProviders(); // Refresh the list
      } catch (err) {
        setError("Failed to delete provider.");
        console.error(err);
      }
    }
  };

  const handleAdd = () => {
    setProviderToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleEdit = (provider: any) => {
    setProviderToEdit(provider);
    setIsAddEditModalOpen(true);
  };

  const handleSuccess = () => {
    fetchProviders();
    setIsAddEditModalOpen(false);
  };

  const handleTestSend = (providerId: number) => {
    setProviderIdForTestSend(providerId);
    setIsTestSendModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-medium">Configured Providers</h3>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={handleAdd}
          >
            Add Provider
          </button>
        </div>
        <div className="p-4">
          {providers.length === 0 ? (
            <p>No email providers configured yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {providers.map((provider: any) => (
                <li key={provider.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{provider.name}</p>
                    <p className="text-sm text-gray-500">
                      {provider.type} - {provider.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      className="text-sm text-blue-500 hover:underline"
                      onClick={() => handleEdit(provider)}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(provider.id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                    <button
                      className="text-sm text-green-500 hover:underline"
                      onClick={() => handleTestSend(provider.id)}
                    >
                      Test Send
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <AddEditEmailProviderModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSuccess={handleSuccess}
        providerToEdit={providerToEdit}
      />
      <SendTestEmailModal
        isOpen={isTestSendModalOpen}
        onClose={() => setIsTestSendModalOpen(false)}
        providerId={providerIdForTestSend}
      />
    </>
  );
};

export default EmailProviderList;
