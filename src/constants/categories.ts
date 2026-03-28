import { CategoryItem } from "@/domain/shared/types/category";

export const categories: {
  left: CategoryItem;
  right: CategoryItem[];
} = {
  left: {
    label: "New Arrivals",
    image: "/assets/images/grid_img_1.png",
    href: "/shop?isNewArrival=true",
  },
  right: [
    {
      label: "Pick Combos",
      image: "/assets/images/grid_img_4.png",

      href: "/gifts",
    },
    {
      label: "Kids",
      image: "/assets/images/grid_img_2.png",
      href: "/kids",
    },
    {
      label: "Mens",
      image: "/assets/images/grid_img_3.png",
      href: "/mens",
    },
    {
      label: "Womens",
      image: "/assets/images/product-5.png",
      href: "/womens",
    },
  ],
};
