// src/domain/shared/types/admin/cms.ts

export type CmsFAQ = {
  _id?: string;
  title: string;
  description: string;
};

export type CmsItem = {
  _id: string;
  name: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  faq?: CmsFAQ[];
};

export type CmsGetAllResponse = {
  success: boolean;
  data: CmsItem[];
};
export type CmsPayload = {
  name: string;
  title: string;
  content: string;
  isActive?: boolean;
  faq?: CmsFAQ[];
};

export type CmsResponse<T> = {
  success: boolean;
  data: T;
};