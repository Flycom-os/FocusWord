/**
 * @page SignIn/Registration
 */
'use client'
import React, { useState } from "react";
import styles from "./index.module.css"
import Input from "@/src/shared/ui/Input/ui-input";
import { Checkbox } from "@/src/shared/ui";
// @ts-ignore
import Button from '@/src/shared/ui/button/ui-button';
import logo from '@/src/public/logo.svg'
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/src/shared/api/auth";
import { useRouter } from "next/navigation";

const SESSION_EXP_KEY = "session_expire_at";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => login({ ...data, remember }),
    onSuccess: () => {
      if (!remember) {
        const expireAt = Date.now() + 60 * 60 * 1000; // +1 час
        localStorage.setItem(SESSION_EXP_KEY, expireAt.toString());
      } else {
        localStorage.removeItem(SESSION_EXP_KEY);
      }
      router.push("/admin");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Ошибка авторизации");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate({ email, password });
  };

  const isError = Boolean(error);

  return <div className="app light">
    <div className={styles.containerSignin}>
      <form className={styles.contentSignIn} onSubmit={handleSubmit}>
        <div className={styles.logo}><Image src={logo} alt={'logo'} height={40}/></div>
        <div>Login</div>hghhgh
        <Input
          placeholder={'Email or phone number'}
          value={email}
          error={isError}
          onChange={e => setEmail(e.target.value)}
          name="email"
          type="text"
          required
        />
        <div>Password</div>
        <Input
          placeholder={'Enter password'}
          value={password}
          error={isError}
          onChange={e => setPassword(e.target.value)}
          name="password"
          type="password"
          required
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Checkbox checked={remember} onChange={() => setRemember(v => !v)} />
          <div>Remember me</div>
        </div>
        <Button
          style={{ width: '360px', height: '40px' }}
          theme={'secondary'}
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Logging in...' : 'Login'}
        </Button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',gap:'10px', borderTop:'1px solid #808080',paddingTop:'15px',marginTop:'10px', fontSize:'12px'}}>
          <div>Dont have an account?</div>
          <a href={'/signup'}>Sign up now</a>
        </div>


      </form>
    </div>
  </div>;
};

export default SignIn;
