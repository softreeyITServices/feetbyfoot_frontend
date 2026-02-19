export interface CreateContactRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
}

export interface Contact {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  __v?: number;
}
