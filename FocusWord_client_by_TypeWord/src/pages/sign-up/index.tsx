/**
 * @page SignUp/Registration
 */
'use client'
import React, { useState } from "react";
import styles from "./index.module.css"
import Input from "@/src/shared/ui/Input/ui-input";
// @ts-ignore
import Button from '@/src/shared/ui/button/ui-button';
import logo from '@/src/public/logo.svg'
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { registration } from "@/src/shared/api/reg";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: {name:string; email: string; password: string; password2:string }) => registration({ ...data}),
    onSuccess: () => {
      router.push("/signin");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || "Ошибка авторизации");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate({name, email, password, password2 });
  };

  const isError = Boolean(error);

  return <div className="app light">
    <div className={styles.containerSignin}>
      <form className={styles.contentSignIn} onSubmit={handleSubmit}>
        <div className={styles.logo}><Image src={logo} alt={'logo'} height={40}/></div>
        <div>Name</div>
        <Input
          placeholder={'Name'}
          value={name}
          error={isError}
          onChange={e => setName(e.target.value)}
          name="name"
          type="text"
          required
        />
        <div>Login</div>
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
        <div>Check password</div>
        <Input
          placeholder={'Enter password'}
          value={password2}
          error={isError}
          onChange={e => setPassword2(e.target.value)}
          name="password"
          type="password"
          required
        />
        <Button
          style={{ width: '360px', height: '40px' }}
          theme={'secondary'}
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Registration...' : 'Registration'}
        </Button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center',gap:'10px', borderTop:'1px solid #808080',paddingTop:'15px',marginTop:'10px', fontSize:'12px'}}>
          <div>Do have an account?</div>
          <a href={'/signin'}>Sign in now</a>
        </div>
      </form>
    </div>
  </div>;
};


export default SignUp;
