import { CategoryItem } from "@/domain/shared/types/category";

export const categories: {
  left: CategoryItem;
  right: CategoryItem[];
} = {
  left: {
    label: "New Arrivals",
    image: "/assets/images/grid_img_1.png",
    href: "/new-arrivals",
  },
  right: [
    {
      label: "Pick Combos",
      image: "/assets/images/grid_img_2.png",
      href: "/pick-combos",
    },
    {
      label: "Kids",
      image: "/assets/images/grid_img_3.png",
      href: "/kids",
    },
    {
      label: "Mens",
      image: "/assets/images/grid_img_3.png",
      href: "/mens",
    },
    {
      label: "Womens",
      image: "/assets/images/grid_img_4.png",
      href: "/womens",
    },
  ],
};
