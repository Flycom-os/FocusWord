"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageDto } from "@/src/shared/api/pages";
import { PageSlider } from "@/src/shared/ui";
import { getMediaUrl } from "@/src/shared/lib/media-url";
import { PageContentView } from "@/src/widgets/page-content/PageContentView";
import { fetchPaymentMethods, createYooMoneyPayment } from "@/src/shared/api/payments";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";
import { PaymentCheckoutCard } from "@/src/widgets/payment-checkout/PaymentCheckoutCard";
import styles from "./PublicPageView.module.css";

interface PublicPageViewProps {
  page: PageDto;
  showMeta?: boolean;
}

export const PublicPageView = ({ page, showMeta = false }: PublicPageViewProps) => {
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState("1000");
  const [description, setDescription] = useState(page.title || "Оплата заказа");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (page.template === "payment") {
      fetchPaymentMethods(null)
        .then((data) => {
          const activeMethods = data.filter((m: any) => m.isEnabled);
          setPaymentMethods(activeMethods);
          if (activeMethods.length > 0) {
            setSelectedMethod(activeMethods[0].slug);
          }
        })
        .catch(() => {
          console.error("Failed to load payment methods");
        });
    }
  }, [page.template]);

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

  if (page.template === "payment") {
    return (
      <div className={styles.checkoutCard}>
        <h2 className={styles.checkoutTitle}>{page.title || "Оплата заказа"}</h2>

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
              placeholder="First Name Last Name"
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

          <h3 className={styles.methodsTitle}>Способ оплаты</h3>
          {paymentMethods.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#ef4444", marginBottom: "1.5rem" }}>
              Нет активных способов оплаты. Пожалуйста, включите шлюзы в админ-панели.
            </p>
          ) : (
            <div className={styles.methodsList}>
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.slug)}
                  className={`${styles.methodOption} ${selectedMethod === method.slug ? styles.methodOptionActive : ""}`}
                >
                  <input
                    type="radio"
                    className={styles.methodRadio}
                    checked={selectedMethod === method.slug}
                    onChange={() => setSelectedMethod(method.slug)}
                  />
                  <div className={styles.methodDetails}>
                    <span className={styles.methodName}>{method.name}</span>
                    {method.description && (
                      <span className={styles.methodDesc}>{method.description}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={paying || paymentMethods.length === 0}
            className={styles.submitButton}
          >
            {paying ? "Инициализация..." : "Перейти к оплате"}
          </button>
        </form>
      </div>
    );
  }
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1 className={styles.title}>{page.title}</h1>
        {showMeta && page.publishedAt && (
          <p className={styles.meta}>
            Publishedо: {new Date(page.publishedAt).toLocaleDateString("ru-RU")}
          </p>
        )}
      </header>

      {page.featuredSlider && (
        <section className={styles.featured}>
          <PageSlider slider={page.featuredSlider} autoPlay interval={5000} showArrows showDots />
        </section>
      )}

      {!page.featuredSlider && page.featuredImage && (
        <section className={styles.featured}>
          <img
            src={getMediaUrl(page.featuredImage.filepath)}
            alt={page.featuredImage.filename}
            className={styles.featuredImage}
          />
        </section>
      )}

      <section className={styles.content}>
        <PageContentView page={page} publicMode />
      </section>

      {page.template !== "payment" && page.paymentMethodId && (
        <PaymentCheckoutCard title={page.title} paymentMethodId={page.paymentMethodId} />
      )}

      {page.categories && page.categories.length > 0 && (
        <section className={styles.categories}>
          <h3>Categories:</h3>
          <div className={styles.categoryTags}>
            {page.categories.map((cat: any) => (
              <span key={cat.id} className={styles.categoryTag}>
                {cat.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {(page.seoTitle || page.seoDescription) && showMeta && (
        <footer className={styles.seo}>
          {page.seoTitle && (
            <p>
              <strong>SEO:</strong> {page.seoTitle}
            </p>
          )}
          {page.seoDescription && <p>{page.seoDescription}</p>}
        </footer>
      )}
    </article>
  );
};

export const PublicPageLoading = () => {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Загрузка страницы...</p>
    </div>
  );
};

export const PublicPageNotFound = () => {
  return (
    <div className={styles.notFound}>
      <h1>404</h1>
      <p>Страница не найдена или ещё не опубликована.</p>
      <Link href="/">На главную</Link>
    </div>
  );
};
