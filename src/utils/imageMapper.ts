import mustard from "../assets/images/mustard_oil_bottle_1784627574874.jpg";
import canola from "../assets/images/canola_oil_product_1784633101147.jpg";
import sesame from "../assets/images/sesame_oil_product_1784633122477.jpg";
import taramira from "../assets/images/taramira_oil_product_1784633146026.jpg";
import khall from "../assets/images/animal_feed_khall_1784627597758.jpg";

export function getProductImage(image: string): string {
  if (!image) return mustard;

  const str = image.toLowerCase();

  if (str.includes("canola")) return canola;
  if (str.includes("sarson") || str.includes("mustard")) return mustard;
  if (str.includes("til") || str.includes("sesame")) return sesame;
  if (str.includes("taramira")) return taramira;
  if (str.includes("khall") || str.includes("wanda") || str.includes("feed") || str.includes("animal")) return khall;

  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) {
    return image;
  }

  return mustard;
}