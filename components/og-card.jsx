import Head from "next/head";
import { useRouter } from "next/router";

const DESCRIPTION = "Lonuhiri";

export default function OGCard({ title, description, image, shortTitle }) {
  const { asPath } = useRouter();
  const pagetTitle = title ? `Lonuhiri - ${title}` : "Lonuhiri";

  return (
    <Head>
      <title>{pagetTitle}</title>
      <meta
        key="meta-description"
        name="description"
        content={description ?? DESCRIPTION}
      />
      <link rel="canonical" href={`${process.env.NEXT_PUBLIC_API_URL}`} />

      <meta
        property="og:url"
        content={`${process.env.NEXT_PUBLIC_API_URL}${asPath}`}
      />
      <meta property="og:title" content={pagetTitle} />
      <meta property="og:description" content={description ?? DESCRIPTION} />
      <meta
        property="og:image"
        name="image"
        key="ogImage"
        content={`${
          image ? image : `${process.env.NEXT_PUBLIC_API_URL}/sm-card-2.png`
        }`}
      />
      <meta property="og:updated_time" content={new Date().toISOString()} />
      <meta
        property="og:site_name"
        content="Lonuhiri"
        key="ogSiteName"
        itemProp="name"
      />
      <meta property="og:title" key="ogTitle" content={shortTitle} />
      <meta property="og:type" key="ogType" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pagetTitle} />
      <meta
        property="twitter:url"
        content={`${process.env.NEXT_PUBLIC_API_URL}${asPath}`}
      />
      <meta name="twitter:description" content={description ?? DESCRIPTION} />
      {image && (
        <meta
          name="twitter:image"
          key="twitterImage"
          content={`${
            image ? image : `${process.env.NEXT_PUBLIC_API_URL}/sm-card-2.jpg`
          }`}
        />
      )}
      <meta
        name="viewport"
        content="height=device-height, width=device-width, maximum-scale=1.0, minimum-scale=1.0, initial-scale=1.0, user-scalable=no"
      />
      {/* No official favicon has been supplied yet. */}
      <link rel="icon" href="data:," />
    </Head>
  );
}
