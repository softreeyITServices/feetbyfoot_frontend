import { SVGProps } from "react";

export const RatingHalfStarIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="half_star_gradient">
        <stop offset="50%" stopColor="#FACC15" />
        <stop offset="50%" stopColor="#D1D5DB" stopOpacity="1" />
      </linearGradient>
    </defs>
    <path 
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" 
      fill="url(#half_star_gradient)" 
    />
  </svg>
);
