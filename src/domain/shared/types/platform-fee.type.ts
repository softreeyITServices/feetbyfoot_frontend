export interface PlatformFee {
  _id: string;
  name: string;
  amount?: number;
  MinAmount?: number;
  percentage?: number;
  applicableTo?: "ALL" | "COD" | "ONLINE";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/* ----------- CREATE ----------- */
export interface CreatePlatformFeeRequest {
  name: string;
  amount?: number;
  MinAmount?: number;
  percentage?: number;
  applicableTo?: "ALL" | "COD" | "ONLINE";
  isActive: boolean;
}

/* ----------- UPDATE ----------- */
export type UpdatePlatformFeeRequest = Partial<CreatePlatformFeeRequest>;
