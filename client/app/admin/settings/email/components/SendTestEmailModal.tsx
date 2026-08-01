// client/app/admin/settings/email/components/SendTestEmailModal.tsx

"use client";

import React, { useState } from "react";
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
};

interface SendTestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: number | null;
}

const SendTestEmailModal: React.FC<SendTestEmailModalProps> = ({ isOpen, onClose, providerId }) => {
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("Test Email");
  const [htmlBody, setHtmlBody] = useState("<p>This is a test email.</p>");
  const [textBody, setTextBody] = useState("This is a test email.");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerId) {
      setError("No provider selected.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = { providerConfigId: providerId, to, from, subject, htmlBody, textBody };

    try {
      await apiClient.post("/email-providers/send-test", payload);
      setSuccess("Test email sent successfully!");
    } catch (err) {
      setError(err.message || "Failed to send test email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Test Email">
      <form onSubmit={handleSubmit}>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">From Email</label>
          <input
            type="email"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
            placeholder="sender@example.com"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">To Email</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
            placeholder="recipient@example.com"
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
            value={htmlBody}
            onChange={(e) => setHtmlBody(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows={4}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Test"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SendTestEmailModal;
