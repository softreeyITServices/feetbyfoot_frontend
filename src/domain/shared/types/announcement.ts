export type Announcement = {
  _id: string;
  message: string;
  isActive: boolean;
  priority: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAnnouncementBody = {
  message: string;
  isActive?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
};

export type UpdateAnnouncementBody = Partial<CreateAnnouncementBody>;
