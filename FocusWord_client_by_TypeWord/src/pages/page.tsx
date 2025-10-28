/**
 * @page Root
 */

'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomePage from "./home/page";

const RootPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем на главную страницу
    router.push('/home');
  }, [router]);

  return <HomePage />;
};

export default RootPage;
