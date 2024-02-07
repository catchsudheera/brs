import "../app/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import Navigation from "@/components/Navigation";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Navigation />
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
