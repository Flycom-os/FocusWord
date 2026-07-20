"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/src/shared/ui/Input/ui-input";
import Button from "@/src/shared/ui/Button/ui-button";
import {
  fetchPaymentGateways,
  fetchPaymentMethods,
  createPaymentGateway,
  updatePaymentGateway,
  deletePaymentGateway,
  togglePaymentGateway,
} from "@/src/shared/api/payments";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  Pagination,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/src/shared/ui";
import styles from "./payments.module.css";

export default function PaymentsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [gateways, setGateways] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"gateways" | "methods">("gateways");
  const [showModal, setShowModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    isEnabled: false,
    settings: "",
    displayOrder: 0,
  });

  useEffect(() => {
    if (accessToken) {
      loadData();
    }
  }, [accessToken]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gatewaysData, methodsData] = await Promise.all([
        fetchPaymentGateways(accessToken),
        fetchPaymentMethods(accessToken),
      ]);
      setGateways(gatewaysData);
      setMethods(methodsData);
    } catch (error) {
      showToast("Error loading payment data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGateway = () => {
    setEditingGateway(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      isEnabled: false,
      settings: "",
      displayOrder: 0,
    });
    setShowModal(true);
  };

  const handleEditGateway = (gateway: any) => {
    setEditingGateway(gateway);
    setForm({
      name: gateway.name,
      slug: gateway.slug,
      description: gateway.description || "",
      isEnabled: gateway.isEnabled,
      settings: JSON.stringify(gateway.settings || {}, null, 2),
      displayOrder: gateway.displayOrder,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const gatewayData = {
        ...form,
        settings: form.settings ? JSON.parse(form.settings) : {},
      };

      if (editingGateway) {
        await updatePaymentGateway(accessToken, editingGateway.id, gatewayData);
        showToast("Payment gateway updated", "success");
      } else {
        await createPaymentGateway(accessToken, gatewayData);
        showToast("Payment gateway created", "success");
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      showToast("Error saving payment gateway", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this payment gateway?")) {
      try {
        await deletePaymentGateway(accessToken, id);
        showToast("Payment gateway deleted", "success");
        loadData();
      } catch (error) {
        showToast("Error deleting payment gateway", "error");
      }
    }
  };

  const handleToggle = async (id: number, isEnabled: boolean) => {
    try {
      await togglePaymentGateway(accessToken, id, isEnabled);
      showToast(`Payment gateway ${isEnabled ? "enabled" : "disabled"}`, "success");
      loadData();
    } catch (error) {
      showToast("Error changing status", "error");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "card":
        return "💳";
      case "bank":
        return "🏦";
      case "crypto":
        return "₿";
      default:
        return "💰";
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Payment System</h1>
        <p>Manage payment gateways and methods</p>
      </div>

      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("gateways")}
          className={`${styles.tab} ${activeTab === "gateways" ? styles.active : ""}`}
        >
          Payment Gateways
        </button>
        <button
          onClick={() => setActiveTab("methods")}
          className={`${styles.tab} ${activeTab === "methods" ? styles.active : ""}`}
        >
          Payment Methods
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          {activeTab === "gateways" && (
            <div className={styles.content}>
              <div className={styles.toolbar}>
                <Button onClick={handleCreateGateway} className={styles.createButton}>
                  ➕ Create Gateway
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gateways.map((gateway) => (
                    <TableRow key={gateway.id}>
                      <TableCell>
                        <div className={styles.gatewayInfo}>
                          <div className={styles.gatewayName}>{gateway.name}</div>
                          {gateway.description && (
                            <div className={styles.gatewayDescription}>{gateway.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{gateway.slug}</TableCell>
                      <TableCell>
                        <span
                          className={`${styles.status} ${gateway.isEnabled ? styles.enabled : styles.disabled}`}
                        >
                          {gateway.isEnabled ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>{gateway.displayOrder}</TableCell>
                      <TableCell>
                        <div className={styles.actions}>
                          <Button
                            onClick={() => handleEditGateway(gateway)}
                            className={styles.editButton}
                          >
                            ✏️
                          </Button>
                          <Button
                            onClick={() => handleToggle(gateway.id, !gateway.isEnabled)}
                            className={`${styles.toggleButton} ${gateway.isEnabled ? styles.disable : styles.enable}`}
                          >
                            {gateway.isEnabled ? "🔴" : "🟢"}
                          </Button>
                          <Button
                            onClick={() => handleDelete(gateway.id)}
                            className={styles.deleteButton}
                          >
                            🗑️
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === "methods" && (
            <div className={styles.content}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gateway</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell>
                        <div className={styles.methodInfo}>
                          <span className={styles.methodIcon}>{getTypeIcon(method.type)}</span>
                          <div>
                            <div className={styles.methodName}>{method.name}</div>
                            {method.description && (
                              <div className={styles.methodDescription}>{method.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{method.slug}</TableCell>
                      <TableCell>
                        <span className={styles.type}>{method.type}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`${styles.status} ${method.isEnabled ? styles.enabled : styles.disabled}`}
                        >
                          {method.isEnabled ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>{method.paymentGatewayId || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingGateway ? "Edit Gateway" : "Create Gateway"}
      >
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter gateway name"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="payment-gateway-slug"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Payment gateway description"
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Display Order</label>
            <Input
              type="number"
              value={form.displayOrder}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))
              }
              placeholder="0"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Settings (JSON)</label>
            <textarea
              value={form.settings}
              onChange={(e) => setForm((prev) => ({ ...prev, settings: e.target.value }))}
              placeholder='{"apiKey": "...", "secretKey": "..."}'
              className={styles.textarea}
              rows={6}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.isEnabled}
                onChange={(e) => setForm((prev) => ({ ...prev, isEnabled: e.target.checked }))}
              />
              Active
            </label>
          </div>

          <div className={styles.modalActions}>
            <Button onClick={handleSave} className={styles.saveButton}>
              {editingGateway ? "Save" : "Create"}
            </Button>
            <Button onClick={() => setShowModal(false)} className={styles.cancelButton}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
