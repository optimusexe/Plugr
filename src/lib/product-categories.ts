export const PRODUCT_CATEGORIES = [
  "Barber & Beauty",
  "Graphic Design",
  "Food & Drinks",
  "Fashion",
  "Perfume & Scents",
  "Tech & Repairs",
  "Photography & Video",
  "Academic & Study",
  "Arts & Crafts",
  "Fitness",
  "Event & Decor",
  "Cleaning",
  "Tutoring",
  "Tailoring",
  "Other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function isProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}
