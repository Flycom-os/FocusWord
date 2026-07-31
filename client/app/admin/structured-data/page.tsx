"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  fetchStructuredData,
  createStructuredData,
  updateStructuredData,
  deleteStructuredData,
} from "@/src/shared/api/structured-data";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  Pagination,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  UiButton,
} from "@/src/shared/ui";
import styles from "./structured-data.module.css";

export default function StructuredDataPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, [pagination.page, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchStructuredData(accessToken, {
        page: pagination.page,
        limit: pagination.limit,
        search,
      });
      setData(response.data);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error) {
      showToast("Error loading structured data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this data?")) {
      try {
        await deleteStructuredData(accessToken, id);
        showToast("Data deleted", "success");
        loadData();
      } catch (error) {
        showToast("Error deleting data", "error");
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Structured Data</h1>
        <p>JSON-LD markup for SEO</p>
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Search data..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />
      </div>

      {loading ? (
        <div className={styles.loading}> Loading... </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead> Type </TableHead>
              <TableHead> Status </TableHead>
              <TableHead> Created At </TableHead>
              <TableHead> Actions </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className={styles.type}>
                    <span className={styles.typeIcon}>📋</span>
                    {item.type}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`${styles.status} ${item.isActive ? styles.active : styles.inactive}`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className={styles.actions}>
                    <UiButton theme="warning" onClick={() => handleDelete(item.id)} className={styles.deleteButton}>
                      🗑️ Delete
                    </UiButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {pagination.total > pagination.limit && (
        <div className={styles.pagination}>
          <Pagination
            page={pagination.page}
            total={pagination.total}
            perPage={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      )}
    </div>
  );
}
