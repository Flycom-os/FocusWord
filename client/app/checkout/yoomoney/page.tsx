"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./yoomoney.module.css";

const YooMoneyCheckoutContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Params from url
  const amount = searchParams?.get("amount") || "0";
  const description = searchParams?.get("description") || "Оплата заказа";
  const email = searchParams?.get("email") || "";
  const name = searchParams?.get("name") || "";

  // Card details states
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  // Loading & simulation states
  const [status, setStatus] = useState<
    "idle" | "connecting" | "authorizing" | "transferring" | "success"
  >("idle");
  const [loadingText, setLoadingText] = useState("");

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    setCardNumber(parts.join(" "));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvc(value);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, "").length < 16) return;
    if (expiry.length < 5) return;
    if (cvc.length < 3) return;

    setStatus("connecting");
  };

  useEffect(() => {
    if (status === "idle") return;

    let timeout: NodeJS.Timeout;

    if (status === "connecting") {
      setLoadingText("Установка безопасного соединения...");
      timeout = setTimeout(() => setStatus("authorizing"), 1500);
    } else if (status === "authorizing") {
      setLoadingText("Проверка банковских данных...");
      timeout = setTimeout(() => setStatus("transferring"), 1500);
    } else if (status === "transferring") {
      setLoadingText("Проведение платежной операции...");
      timeout = setTimeout(() => setStatus("success"), 1200);
    } else if (status === "success") {
      setLoadingText("Платеж успешно проведен!");
      timeout = setTimeout(() => {
        const query = new URLSearchParams({
          amount,
          description,
          email,
          name,
        });
        router.push(`/checkout/success?${query.toString()}`);
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [status, amount, description, email, name, router]);

  return (
    <div className={styles.checkoutCard}>
      <div className={styles.yoomoneyHeader}>
        <span className={styles.yoomoneyLogo}>ЮMoney</span>
        <span className={styles.yoomoneySub}>Касса</span>
      </div>

      {status === "idle" ? (
        <form onSubmit={handlePay}>
          <div className={styles.orderInfo}>
            <div className={styles.amount}>
              {parseFloat(amount).toLocaleString("ru-RU")}{" "}
              <span className={styles.amountCurrency}>₽</span>
            </div>
            <p className={styles.description}>{description}</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Номер карты</label>
            <input
              type="text"
              className={styles.input}
              value={cardNumber}
              onChange={handleCardChange}
              placeholder="0000 0000 0000 0000"
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Срок действия</label>
              <input
                type="text"
                className={styles.input}
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="ММ/ГГ"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>CVC / CVV</label>
              <input
                type="password"
                className={styles.input}
                value={cvc}
                onChange={handleCvcChange}
                placeholder="•••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              cardNumber.replace(/\s/g, "").length < 16 || expiry.length < 5 || cvc.length < 3
            }
            className={styles.payButton}
          >
            Оплатить {parseFloat(amount).toLocaleString("ru-RU")} ₽
          </button>
        </form>
      ) : (
        <div className={styles.loaderOverlay}>
          <div className={styles.spinner} />
          <div className={styles.loaderText}>{loadingText}</div>
          <div className={styles.loaderSub}>Пожалуйста, не закрывайте эту вкладку</div>
        </div>
      )}
    </div>
  );
};

export default function YooMoneyCheckoutPage() {
  return (
    <div className={styles.container}>
      <Suspense
        fallback={
          <div
            className={styles.checkoutCard}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
            }}
          >
            <div className={styles.spinner} />
            <div className={styles.loaderText} style={{ marginTop: "1rem" }}>
              Загрузка платежной формы...
            </div>
          </div>
        }
      >
        <YooMoneyCheckoutContent />
      </Suspense>
    </div>
  );
}
