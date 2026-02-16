export interface PlatformFee {
  _id: string;
  name: string;
  amount?: number;
  MinAmount?: number;
  percentage?: number;
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
  isActive: boolean;
}

/* ----------- UPDATE ----------- */
export type UpdatePlatformFeeRequest = Partial<CreatePlatformFeeRequest>;
