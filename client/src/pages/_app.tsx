import type { AppProps } from "next/app";
import AppWrapper from "@/src/_app";
import "@/src/app/styles/index.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppWrapper>
      <Component {...pageProps} />
    </AppWrapper>
  );
}
