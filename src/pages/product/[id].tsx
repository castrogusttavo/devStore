import React from 'react';
import { ImageContainer, ProductContainer, ProductDetails } from './products';
import Image from 'next/image';
import { GetStaticProps } from 'next';
import { stripe } from '@/src/lib/stripe';
import Stripe from 'stripe';
import axios from 'axios';
import { useState } from 'react';
import Head from 'next/head';

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string;
    defaultPriceId: string;
  }
}

export default function Product({ product }: ProductProps) {
  /* const router = useRouter() */
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false)

  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true)

      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId
      })

      const { checkoutUrl } = response.data

      // router.push('/checkout') página interna

      window.location.href = checkoutUrl // página externa
    } catch (err) {
      // COnectar com uma ferramenta de observabilidade (Datadog, Sentry)

      setIsCreatingCheckoutSession(false)

      alert('Falha ao redirecionar ao checkout!')
    }
  }

  return (
    <>
    <Head>
      <title>{product.name} | Ignite Shop</title>
    </Head>

    <ProductContainer>
      <ImageContainer>
        <Image src={product.imageUrl} width={520} height={480} alt={product.name} objectFit="cover" />
      </ImageContainer>

      <ProductDetails>
        <h1>{product.name}</h1>
        <span>{product.price}</span>
        <p>{product.description}</p>

        <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>Comprar agora</button>
      </ProductDetails>
    </ProductContainer>
    </>
  );
}

// gerar página estática por produto

export const getStaticPaths = async () => {
  // Buscar os produtos mais vendidos / mais acessados
  
  return {
    paths: [
      {
        params: { id: 'prod_Q3FYE1TRme4F8j' }
      }
    ],
    fallback: 'blocking' 
    // acessar a página de um produto que não foi gerado, irá retornar 404
  }
}

export const getStaticProps: GetStaticProps<any, { id: string | any }> = async ({ params }) => {
  const productId = params?.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price']
  })

  const price = product.default_price as Stripe.Price
  
  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0] || null,
        price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL' }).format(price.unit_amount ? price.unit_amount / 100 : 0,),
        description: product.description,
        defaultPriceId: price.id
      }
    },
    revalidate: 60 * 60 * 1, // 1 hour
  }
}