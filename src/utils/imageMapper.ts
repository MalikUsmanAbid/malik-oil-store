import mustard from "../assets/images/mustard_oil_bottle_1784627574874.jpg";
import canola from "../assets/images/canola_oil_product_1784633101147.jpg";
import sesame from "../assets/images/sesame_oil_product_1784633122477.jpg";
import taramira from "../assets/images/taramira_oil_product_1784633146026.jpg";
import khall from "../assets/images/animal_feed_khall_1784627597758.jpg";

export function getProductImage(image: string): string {
  if (!image) return mustard;

  if (image.startsWith("http") || image.startsWith("data:")) {
    return image;
  }

  switch (image.toLowerCase()) {
    case "canola":
      return canola;

    case "sarson":
      return mustard;

    case "til":
      return sesame;

    case "taramira":
      return taramira;

    case "khall":
    case "wanda":
      return khall;

    default:
      return mustard;
  }
}