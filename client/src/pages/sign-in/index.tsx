/**
 * @page SignIn/Registration
 */
'use client';

import { FormEvent, useState } from "react";
import Input from "@/src/shared/ui/Input/ui-input";
import { UiButton, Notifications, showToast } from "@/src/shared/ui";
import { ToastType } from "@/src/shared/ui/Notifications/ui-notifications";
import styles from "@/src/pages/sign-in/index.module.css";
import { useAuth } from "@/src/app/providers/auth-provider";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import logo from "@/src/public/logo.svg"

type Mode = "login" | "register";

const SignIn = () => {
  const [mode, setMode] = useState<Mode>("login");
  const { login, register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") || "");
    const password = String(formData.get("password") || "");

    setLoading(true);
    try {
      if (mode === "login") {
        await login({ identifier, password });
        showToast("Login successful. Redirecting to admin panel...", "success");
        setTimeout(() => {
          router.replace("/admin");
        }, 1500);
      } else {
        const email = String(formData.get("email") || "");
        const name = String(formData.get("name") || "");
        const surname = String(formData.get("surname") || "");
        const confirmPassword = String(formData.get("confirmPassword") || "");

        if (password !== confirmPassword) {
          setPasswordError("Passwords do not match");
          setLoading(false);
          return;
        }

        setPasswordError("");

        await register({ email, password, name, surname });
        showToast("Registration successful. Redirecting to admin panel...", "success");
        setTimeout(() => {
          router.replace("/admin");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Auth error:", error);

      let errorMessage = "An error occurred during authorization";
      let errorType: ToastType = "error";

      if (error?.response?.status === 401) {
        errorMessage = "Invalid email/phone or password. Please check your credentials and try again.";
      } else if (error?.response?.status === 403) {
        errorMessage = "Access denied. You do not have sufficient permissions to log in.";
      } else if (error?.response?.status === 404) {
        errorMessage = "User not found. Please check the entered data.";
      } else if (error?.response?.status === 409) {
        errorMessage = "A user with this email already exists. Please use a different email.";
      } else if (error?.response?.status === 422) {
        errorMessage = "Invalid data. Please check all form fields.";
        errorType = "warning";
      } else if (error?.response?.status === 429) {
        errorMessage = "Too many login attempts. Please try again in a few minutes.";
        errorType = "warning";
      } else if (error?.response?.status >= 500) {
        errorMessage = "Server error. Please try again later or contact support.";
      } else if (error?.code === "NETWORK_ERROR" || !navigator.onLine) {
        errorMessage = "Network connection issue. Please check your internet connection.";
        errorType = "warning";
      } else if (error?.response?.data?.message) {
        errorMessage = `${error.response.data.message}`;
      } else if (error?.message) {
        errorMessage = `${error.message}`;
      }

      showToast(errorMessage, errorType);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (newMode: Mode) => {
    if (newMode !== mode && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setMode(newMode);
        setIsAnimating(false);
      }, 150);
    }
  };

  return (
    <div className="app light">
      <Notifications />
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <Image src={logo} width={150} alt={'Focus Word'} />
          </div>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${mode === "login" ? styles.active : ""}`}
              onClick={() => handleModeSwitch("login")}
            >
              Sign In
            </button>
            {/* <button
              type="button"
              className={`${styles.tab} ${mode === "register" ? styles.active : ""}`}
              onClick={() => handleModeSwitch("register")}
            >
              Register
            </button> */}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {!isAnimating && (
              <>
                {/* {mode === "register" && (
                  <>
                    <div className={styles.formField}>
                      <Input name="email" type="email" placeholder="Email" required className={styles.input} />
                    </div>
                    <div className={styles.formField}>
                      <Input name="name" placeholder="First Name" className={styles.input} />
                    </div>
                    <div className={styles.formField}>
                      <Input name="surname" placeholder="Last Name" className={styles.input} />
                    </div>
                  </>
                )} */}

                {mode === "login" && (
                  <div className={styles.formField}>
                    <Input
                      name="identifier"
                      placeholder="Email or phone"
                      className={styles.input}
                    />
                  </div>
                )}

                <div className={styles.formField}>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className={styles.input}
                    required
                  />
                </div>

                {/* {mode === "register" && (
                  <div className={styles.formField}>
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      className={styles.input}
                      required
                    />
                    {passwordError && (
                      <div className={styles.passwordError}>
                        {passwordError}
                      </div>
                    )}
                  </div>
                )} */}

                <div className={styles.formField}>
                  <UiButton
                    theme="primary"
                    className={`${styles.submit} ${loading ? styles.loading : ''}`}
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? '' : (mode === "login" ? "Sign In" : "Create Account")}
                  </UiButton>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;