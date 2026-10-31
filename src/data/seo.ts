export const SITE_URL = 'https://malikoil.vercel.app';
export const BUSINESS = {
  name: 'Malik Oil Expellers',
  address: 'Tandila Road, Samundri, Faisalabad, Punjab, Pakistan',
  maps: 'https://share.google/13Iq5xfgVYuq55w6Q',
  phone: '0300-7618236',
  whatsapp: '923007618236',
};

export const productGuides = [
  { id: 'p1', slug: 'canola-oil', name: 'Canola Oil', urdu: 'کینولا آئل', text: 'Explore canola oil from Malik Oil Expellers. Check the live shop for the current pack size, price and availability before placing an order.', question: 'How do I order canola oil?', answer: 'Open the shop, select Canola Oil, choose a quantity and review the delivery charge and total at checkout.' },
  { id: 'p2', slug: 'sarson-mustard-oil', name: 'Sarson (Mustard) Oil', urdu: 'سرسوں کا تیل', text: 'Looking for sarson ka tel in Samundri? Explore mustard oil from Malik Oil Expellers and confirm the pack label and intended use with the store before purchasing.', question: 'Are sarson oil and mustard oil the same product name?', answer: 'Sarson is the Urdu name used for mustard. The store lists its mustard oil as Sarson Oil (Mustard); check the product label for details.' },
  { id: 'p3', slug: 'til-sesame-oil', name: 'Til (Sesame) Oil', urdu: 'تل کا تیل', text: 'Explore til oil, also called sesame oil, from Malik Oil Expellers. Current prices and available pack sizes appear in the shop.', question: 'What is til oil called in English?', answer: 'Til oil is called sesame oil in English. You can find it in the shop under Til Oil (Sesame).' },
  { id: 'p4', slug: 'taramira-oil', name: 'Taramira Oil', urdu: 'تارامیرا کا تیل', text: 'Explore taramira (rocket seed) oil from Malik Oil Expellers. Ask the store about the label and intended use; this page does not make treatment or medical claims.', question: 'How can I check the intended use of taramira oil?', answer: 'Read the pack label and contact the store before ordering. Do not assume a product is suitable for eating or treating a condition from its name alone.' },
  { id: 'p5', slug: 'sarson-khall', name: 'Sarson Khall (Mustard Cake)', urdu: 'سرسوں کی کھل', text: 'Explore sarson khall, the oil cake left after mustard seed pressing. Contact Malik Oil Expellers about current stock, bag sizes and bulk delivery arrangements.', question: 'Can I order khall in bulk?', answer: 'Contact the store to confirm quantity, current availability, bag size and transport arrangements before placing a bulk order.' },
  { id: 'p6', slug: 'wanda-feed', name: 'Wanda Livestock Feed', urdu: 'ونڈا', text: 'Explore wanda livestock feed from Malik Oil Expellers. Ask the store for the current product label, ingredients and pack size before ordering.', question: 'Where can I check wanda feed details?', answer: 'Contact the store for the current label and composition. A livestock nutrition professional can advise on a ration suitable for your animals.' },
];

export const faqs = [
  { question: 'Where is Malik Oil Expellers located?', answer: `Malik Oil Expellers is on ${BUSINESS.address}. Use the Google Maps link on the contact page for directions.` },
  { question: 'Which products can I find in the shop?', answer: 'The shop lists canola oil, sarson (mustard) oil, til (sesame) oil, taramira oil, sarson khall and wanda feed. Check the live shop for current availability and pack sizes.' },
  { question: 'How do I place an order?', answer: 'Choose available items in the shop, add them to your cart, enter delivery details and review the total. Your order is confirmed only when an invoice is displayed.' },
  { question: 'Can I pay with cash on delivery or Easypaisa?', answer: 'Cash on delivery is the currently supported checkout method. Easypaisa online payment is not enabled yet; do not send payment based on an assumed payment instruction.' },
  { question: 'How much is delivery and is sales tax added?', answer: 'The delivery charge and final total are shown before confirmation. The website currently adds no sales tax. For bulk cargo or delivery availability, confirm arrangements with the store.' },
  { question: 'How can I track an order?', answer: 'Open Track Order and enter your invoice number and the delivery phone number used at checkout. Keep both details private.' },
  { question: 'What should I do if an item is damaged or incorrect?', answer: 'Contact the store with your invoice number and a description of the issue. Confirm return and resolution arrangements before sending an item back.' },
];

export function pageForPath(path: string) {
  const normalized = path.replace(/\/$/, '') || '/';
  const guide = productGuides.find(p => normalized === `/products/${p.slug}`);
  if (guide) return { path: normalized, title: `${guide.name} in Samundri | Malik Oil Expellers`, description: guide.text, heading: guide.name, guide, index: true };
  const pages = {
    '/': ['Malik Oil Expellers Samundri | Oils, Khall & Wanda', 'Explore canola, sarson, til and taramira oils, khall and wanda at Malik Oil Expellers, Tandila Road, Samundri, Faisalabad. Shop online with COD.', 'Oils, Khall & Wanda in Samundri'],
    '/products': ['Oils, Khall & Wanda Products | Malik Oil Expellers', 'Browse oil and livestock feed product guides, then check current prices, pack sizes and availability in the Malik Oil Expellers shop.', 'Explore our products'],
    '/about': ['About Malik Oil Expellers | Samundri, Faisalabad', 'Find Malik Oil Expellers on Tandila Road in Samundri, Faisalabad. Explore our oils, khall and wanda and contact the store.', 'About Malik Oil Expellers'],
    '/contact': ['Contact & Directions | Malik Oil Expellers Samundri', 'Get directions to Malik Oil Expellers, Tandila Road, Samundri, Faisalabad. Contact the store about products, bulk orders and delivery.', 'Contact and directions'],
    '/faq': ['Ordering & Delivery Questions | Malik Oil Expellers', 'Answers about ordering oils and livestock feed, cash on delivery, delivery charges, zero added sales tax, order tracking and returns.', 'Ordering questions answered'],
    '/policies': ['Delivery, Returns & Privacy | Malik Oil Expellers', 'Read how Malik Oil Expellers handles delivery enquiries, damaged items, returns, order information and browser storage.', 'Delivery, returns and privacy'],
    '/track': ['Track Your Order | Malik Oil Expellers', 'Track your Malik Oil Expellers order using your invoice and delivery phone number.', 'Track your order'],
  };
  const value = pages[normalized as keyof typeof pages];
  return value ? { path: normalized, title: value[0], description: value[1], heading: value[2], guide: undefined, index: normalized !== '/track' } : { path: normalized, title: 'Page not found | Malik Oil Expellers', description: 'This page could not be found. Return to the Malik Oil Expellers shop.', heading: 'Page not found', guide: undefined, index: false };
}

export const publicPaths = ['/', '/products', ...productGuides.map(p => `/products/${p.slug}`), '/about', '/contact', '/faq', '/policies'];

export function structuredData(path: string) {
  const page = pageForPath(path);
  const organization = { '@type': 'Store', '@id': `${SITE_URL}/#business`, name: BUSINESS.name, url: SITE_URL, image: `${SITE_URL}/images/malik-oil-logo.webp`, address: { '@type': 'PostalAddress', streetAddress: 'Tandila Road', addressLocality: 'Samundri', addressRegion: 'Punjab', addressCountry: 'PK' }, hasMap: BUSINESS.maps };
  const graph: object[] = [organization, { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: BUSINESS.name, publisher: { '@id': `${SITE_URL}/#business` } }, { '@type': 'WebPage', '@id': SITE_URL + page.path, url: SITE_URL + page.path, name: page.title, description: page.description, isPartOf: { '@id': `${SITE_URL}/#website` } }];
  if (path !== '/') graph.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }, ...(page.guide ? [{ '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` }] : []), { '@type': 'ListItem', position: page.guide ? 3 : 2, name: page.heading, item: SITE_URL + page.path }] });
  return { '@context': 'https://schema.org', '@graph': graph };
}
