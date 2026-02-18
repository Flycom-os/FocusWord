/**
 * @page SignIn/Registration
 */
'use client';

import { FormEvent, useState } from "react";
import Input from "@/src/shared/ui/Input/ui-input";
import { UiButton, Notifications, showToast } from "@/src/shared/ui";
import styles from "@/src/pages/sign-in/index.module.css";
import { useAuth } from "@/src/app/providers/auth-provider";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

const SignIn = () => {
  const [mode, setMode] = useState<Mode>("login");
  const { login, register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") || "");
    const password = String(formData.get("password") || "");

    setLoading(true);
    try {
      if (mode === "login") {
        await login({ identifier, password });
        router.replace("/admin");
      } else {
        const email = String(formData.get("email") || "");
        const name = String(formData.get("name") || "");
        const surname = String(formData.get("surname") || "");
        const permission = Number(formData.get("permission") || 0) as 0 | 1 | 2;
        await register({ email, password, name, surname, permission });
        router.replace("/admin");
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Ошибка авторизации";
      showToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app light">
      <Notifications />
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.logo}>TypeWord</div>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${mode === "login" ? styles.active : ""}`}
              onClick={() => setMode("login")}
            >
              Вход
            </button>
            <button
              type="button"
              className={`${styles.tab} ${mode === "register" ? styles.active : ""}`}
              onClick={() => setMode("register")}
            >
              Регистрация
            </button>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <Input name="email" type="email" placeholder="Email" required className={styles.input} />
                <Input name="name" placeholder="Имя" className={styles.input} />
                <Input name="surname" placeholder="Фамилия" className={styles.input} />
              </>
            )}

            {mode === "login" && (
              <Input
                name="identifier"
                placeholder="Email или телефон"
                className={styles.input}
                theme="secondary"
              />
            )}

            <Input
              name="password"
              type="password"
              placeholder="Пароль"
              className={styles.input}
            />

            {mode === "register" && (
              <div className={styles.permissionRow}>
                <label className={styles.permissionLabel}>Уровень доступа</label>
                <select name="permission" className={styles.select}>
                  <option value={0}>0 — только читать</option>
                  <option value={1}>1 — редактировать</option>
                  <option value={2}>2 — создавать и удалять</option>
                </select>
              </div>
            )}

            <UiButton theme="primary" className={styles.submit} disabled={loading} type="submit">
              {mode === "login" ? "Войти" : "Создать аккаунт"}
            </UiButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
