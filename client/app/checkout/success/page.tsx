"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import styles from "./success.module.css";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [transactionId, setTransactionId] = useState("");

  const amount = searchParams?.get("amount") || "0";
  const description = searchParams?.get("description") || "Оплата заказа";
  const email = searchParams?.get("email") || "";
  const name = searchParams?.get("name") || "";

  useEffect(() => {
    // Generate a random-looking transaction ID
    const randomId = "TXN-" + Math.floor(100000 + Math.random() * 900000) + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    setTransactionId(randomId);
  }, []);

  const handleReturn = () => {
    router.push("/");
  };

  return (
    <div className={styles.successCard}>
      <div className={styles.iconWrapper}>
        <svg
          className={styles.icon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>

      <h1 className={styles.title}>Оплата успешно проведена!</h1>
      <p className={styles.subtitle}>Спасибо за ваш платеж. Детали транзакции приведены ниже.</p>

      <div className={styles.receipt}>
        <h3 className={styles.receiptTitle}>Детали платежа</h3>
        <div className={styles.detailsList}>
          <div className={styles.detailItem}>
            <span className={styles.itemLabel}>ID транзакции</span>
            <span className={styles.itemValue}>{transactionId}</span>
          </div>
          {name && (
            <div className={styles.detailItem}>
              <span className={styles.itemLabel}>Имя плательщика</span>
              <span className={styles.itemValue}>{name}</span>
            </div>
          )}
          {email && (
            <div className={styles.detailItem}>
              <span className={styles.itemLabel}>Email</span>
              <span className={styles.itemValue}>{email}</span>
            </div>
          )}
          <div className={styles.detailItem}>
            <span className={styles.itemLabel}>Описание</span>
            <span className={styles.itemValue}>{description}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.itemLabel}>Сумма платежа</span>
            <span className={`${styles.itemValue} ${styles.amountValue}`}>
              {parseFloat(amount).toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </div>
      </div>

      <button onClick={handleReturn} className={styles.button}>
        Вернуться на главную
      </button>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className={styles.spinner} style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "#1e293b", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "1rem", color: "#64748b" }}>Загрузка чека...</p>
        </div>
      }>
        <SuccessPageContent />
      </Suspense>
    </div>
  );
}
