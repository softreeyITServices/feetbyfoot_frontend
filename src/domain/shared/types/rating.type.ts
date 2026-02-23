export interface CreateRatingPayload {
  productIds: string[];
  rating: number;
  comment: string;
}

export interface RatingUser {
  _id: string;
  name: string;
  email: string;
}

export interface Review {
  _id: string;
  userId: RatingUser;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface GetRatingResponse {
  reviews: Review[];
  totalRatings: number;
  averageRating: number;
}

export interface GetRatingApiResponse {
  data: GetRatingResponse;
  success: boolean;
  timestamp: string;
}

export interface CreateRatingResponse {
  message: string;
}