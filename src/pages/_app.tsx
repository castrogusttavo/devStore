import { AppProps } from "next/app";
import { globalStyles } from "../styles/global";
import Image from "next/image";

import logoImg from '../assets/ignite-logo.svg';
import { Container, Header } from "../styles/pages/app";
import Link from "next/link";

globalStyles();

export default function App({ Component, pageProps }: AppProps) {  
  return (
    <Container>
      <Header>
       <Link href={`/`}>
          <Image src={logoImg} alt="" />
        </Link>
      </Header>

      <Component {...pageProps} />
    </Container>
  );
}