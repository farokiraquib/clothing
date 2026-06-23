import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title, 
  description, 
  name = "SupremeIt", 
  type = "website",
  image = "/favicon.png", // Default OG image
  url = window.location.href,
  noindex = false
}) {
  const fullTitle = title ? `${title} | ${name}` : `${name} | Casual Fashion Store`;
  const defaultDesc = "SupremeIt - Your destination for casual fashion. Shop curated collections from Nike, Adidas, Zara, Levi's and more.";
  const metaDescription = description || defaultDesc;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={metaDescription} />
      
      {/* Search engine crawling */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph tags (Facebook, LinkedIn, etc.) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={name} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
