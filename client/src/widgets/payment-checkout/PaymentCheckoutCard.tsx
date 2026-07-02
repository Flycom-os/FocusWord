"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createYooMoneyPayment } from "@/src/shared/api/payments";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";
import styles from "./PaymentCheckoutCard.module.css";

interface PaymentCheckoutCardProps {
  title: string;
  paymentMethodId: number;
}

export const PaymentCheckoutCard = ({ title, paymentMethodId }: PaymentCheckoutCardProps) => {
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState("1000");
  const [description, setDescription] = useState(title || "Оплата заказа");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (searchParams) {
      const amt = searchParams.get("amount");
      const desc = searchParams.get("description") || searchParams.get("desc");
      const emailParam = searchParams.get("email");
      const nameParam = searchParams.get("name");
      if (amt) setAmount(amt);
      if (desc) setDescription(desc);
      if (emailParam) setEmail(emailParam);
      if (nameParam) setName(nameParam);
    }
  }, [searchParams]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast("Пожалуйста, введите корректную сумму", "error");
      return;
    }
    if (!email) {
      showToast("Пожалуйста, введите email для получения чека", "error");
      return;
    }

    try {
      setPaying(true);
      const result = await createYooMoneyPayment({
        amount: parseFloat(amount),
        description,
        email,
        name,
      });

      if (result.success && result.redirectUrl) {
        showToast("Перенаправление на страницу оплаты...", "success");
        window.location.href = result.redirectUrl;
      } else {
        showToast("Не удалось запустить платеж", "error");
      }
    } catch (error) {
      showToast("Ошибка при инициализации платежа", "error");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className={styles.checkoutCard}>
      <h2 className={styles.checkoutTitle}>{title || "Оплата заказа"}</h2>
      
      <form onSubmit={handlePay}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Сумма к оплате (₽)</label>
          <input
            type="number"
            className={styles.formInput}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Сумма в рублях"
            required
            min="1"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Назначение платежа</label>
          <input
            type="text"
            className={styles.formInput}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Назначение платежа"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Ваше имя</label>
          <input
            type="text"
            className={styles.formInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя Фамилия"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email (для чека)</label>
          <input
            type="email"
            className={styles.formInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={paying}
          className={styles.submitButton}
        >
          {paying ? "Инициализация..." : "Перейти к оплате"}
        </button>
      </form>
    </div>
  );
};
