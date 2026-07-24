export function getProductImage(image: string): string {
  if (!image) return '/src/assets/images/mustard_oil_bottle_1784627574874.jpg';
  
  if (image.startsWith('http') || image.startsWith('/') || image.startsWith('data:')) {
    return image;
  }
  
  switch (image.toLowerCase()) {
    case 'canola':
      return '/src/assets/images/canola_oil_product_1784633101147.jpg';
    case 'sarson':
      return '/src/assets/images/mustard_oil_bottle_1784627574874.jpg';
    case 'til':
      return '/src/assets/images/sesame_oil_product_1784633122477.jpg';
    case 'taramira':
      return '/src/assets/images/taramira_oil_product_1784633146026.jpg';
    case 'khall':
    case 'wanda':
      return '/src/assets/images/animal_feed_khall_1784627597758.jpg';
    default:
      return '/src/assets/images/mustard_oil_bottle_1784627574874.jpg';
  }
}
