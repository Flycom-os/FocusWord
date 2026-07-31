"use client";

/**
 * @page Records
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BlockManagement from "@/src/widgets/block_management";
import styles from "@/src/pages/records/index.module.css";
import { useAuth } from "@/src/app/providers/auth-provider";
import { fetchRecords, deleteRecord, changeStatus, RecordDto } from "@/src/shared/api/records";
import {
  Pagination,
  PermissionGate,
  UiButton,
  Notifications,
  showToast,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/src/shared/ui";
import Input from "@/src/shared/ui/Input/ui-input";

const defaultQuery = {
  page: 1,
  limit: 20,
  search: "",
};

const RecordsPage = () => {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [records, setRecords] = useState<RecordDto[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!accessToken) {
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetchRecords(accessToken, query.page, query.limit, query.search || "");
        setRecords(res.data || []);
        setTotalRecords(res.total || 0);
      } catch (error: any) {
        console.error("Records: Error loading records:", error);
        const message = error?.response?.data?.message || "Failed to load records";
        showToast(message, "error");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [accessToken, query]);

  const handleSearchChange = (value: string) => {
    setQuery((prev) => ({ ...prev, page: 1, search: value }));
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteRecord(accessToken, id.toString());
      showToast("Record deleted", "success");
      // Re-fetch data
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to delete record";
      showToast(message, "error");
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await changeStatus(accessToken, id.toString(), "published");
      showToast("Record published", "success");
      setRecords(records.map((r) => (r.id === id ? { ...r, status: "published" } : r)));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to publish record";
      showToast(message, "error");
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await changeStatus(accessToken, id.toString(), "draft");
      showToast("Record unpublished", "success");
      setRecords(records.map((r) => (r.id === id ? { ...r, status: "draft" } : r)));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to unpublish record";
      showToast(message, "error");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const totalPages = useMemo(() => {
    if (!query.limit) return 1;
    return Math.max(1, Math.ceil(totalRecords / query.limit));
  }, [totalRecords, query.limit]);

  return (
    <div className={styles.root}>
      <Notifications />
      <BlockManagement type="third" />

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Input
            className={styles.search}
            theme="secondary"
            icon="left"
            placeholder="Search records..."
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <PermissionGate resource="records" level={2}>
          <UiButton theme="primary" onClick={() => router.push("/admin/records/create")}>
            Add Record
          </UiButton>
        </PermissionGate>
      </div>

      <Table className={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className={styles.actionsColumn}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <button
                  className={styles.recordName}
                  onClick={() => router.push(`/admin/records/edit/${record.id}`)}
                >
                  {record.title}
                </button>
              </TableCell>
              <TableCell>{record.slug}</TableCell>
              <TableCell>
                <span className={`${styles.status} ${styles[`status${record.status}`]}`}>
                  {record.status === "published"
                    ? "Published"
                    : record.status === "draft"
                      ? "Draft"
                      : record.status}
                </span>
              </TableCell>
              <TableCell>{formatDate(record.createdAt)}</TableCell>
              <TableCell className={styles.actionsColumn}>
                <UiButton
                  theme="secondary"
                  onClick={() => router.push(`/admin/records/edit/${record.id}`)}
                >
                  Edit
                </UiButton>
                {record.status === "published" ? (
                  <PermissionGate resource="records" level={2}>
                    <UiButton theme="secondary" onClick={() => handleUnpublish(record.id)}>
                      Unpublish
                    </UiButton>
                  </PermissionGate>
                ) : (
                  <PermissionGate resource="records" level={2}>
                    <UiButton theme="primary" onClick={() => handlePublish(record.id)}>
                      Publish
                    </UiButton>
                  </PermissionGate>
                )}
                <PermissionGate resource="records" level={2}>
                  <UiButton theme="warning" onClick={() => handleDelete(record.id)}>
                    Delete
                  </UiButton>
                </PermissionGate>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className={styles.footer}>
        <Pagination
          page={query.page || 1}
          total={totalRecords}
          perPage={query.limit || 20}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default RecordsPage;
