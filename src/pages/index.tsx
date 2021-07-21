import { GetStaticProps } from "next";
import Image from "next/image";

import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";

import styles from "../styles/home.module.scss";

//Client-side
//Server-side
//Static Site Rendering

interface HomeProps {
  product: {
    priceId: string;
    amount: string;
  };
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏️ Hey, Welcome</span>
          <h1>
            New about the <span>React</span> world.
          </h1>

          <p>
            get access to hall the publications <br />
            <span>for {product.amount} month.</span>
          </p>
          <SubscribeButton />
        </section>
        <Image
          src="/images/avatar.svg"
          alt="girl-coding"
          height={500}
          width={300}
        />
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve("price_1J38IRDsUWXqKU28VD8Dvl4X");

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price.unit_amount / 100),
  };
  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24, // 60 seg * 60 min * 24hr = 86400 mils ou 24horas
  };
};
