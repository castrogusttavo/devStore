import { Link } from "phosphor-react";
import { ImageContainer, SuccessContainer } from "../styles/pages/success";
import { GetServerSideProps } from "next";
import Stripe from "stripe";
import Image from "next/image";
import { stripe } from "../lib/stripe";
import Head from "next/head";

interface SuccessProps {
  costumerName: string;
  product: {
    name: string;
    imageUrl: string;
  }
}

export default function Success({ costumerName, product }: SuccessProps) {
  return (
    <>
    <Head>
      <title>Compra Efetuada | Ignite Shop</title>

      <meta name="robots" content="noindex" />
    </Head>

    <SuccessContainer>
      <h1>Pagamento Efetuado!</h1>

      <ImageContainer>
        <Image src={product.imageUrl} width={120} height={110} alt={product.name} />
      </ImageContainer>

      <span>Uhuu! <strong>{costumerName}</strong>, sua  <strong>{product.name}</strong> já está a caminho da sua casa.</span>
    
    <Link href="/">
      Voltar ao catálogo
    </Link>
    </SuccessContainer>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query, params }) => {
  if (!query.session_id) {
    return {
      redirect: {
        destination: '/',
        permanent: false // só acontece caso não tenha session_id
      }
    }
  }
  
  const sessionId = String(query.session_id)

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product']
  })

  const costumerName = session.customer_details?.name;
  const product = session.line_items?.data[0]?.price?.product as Stripe.Product;
  return {
    props: {
      costumerName,
      product: {
        name: product.name,
        imageUrl: product.images[0]
      }
    }
  }
}