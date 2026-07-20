// client/app/admin/settings/domains/components/DomainVerificationModal.tsx

"use client";

import React, { useState } from "react";
import Modal from "../../email/components/Modal";

const apiClient = {
  post: (url) =>
    fetch(`http://localhost:3001/api${url}`, {
      method: "POST",
    }).then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    }),
};

interface DomainVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  domain: any | null;
}

const DomainVerificationModal: React.FC<DomainVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  domain,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!domain) return null;

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post(`/domains/${domain.id}/verify`);
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.message ||
          "Verification failed. Please ensure the TXT record is correctly set up and has propagated.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Verify Domain: ${domain.name}`}>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <p className="mb-4">
        To verify your domain, add the following TXT record to your DNS settings:
      </p>

      <div className="bg-gray-100 p-4 rounded-md mb-4">
        <p className="font-mono text-sm">
          <strong>Type:</strong> TXT
          <br />
          <strong>Host/Name:</strong> _gemini-verify.{domain.name}
          <br />
          <strong>Value:</strong> {domain.verificationToken}
        </p>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        DNS changes can take some time to propagate. Please wait a few minutes before clicking
        verify.
      </p>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handleVerify}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </Modal>
  );
};

export default DomainVerificationModal;
