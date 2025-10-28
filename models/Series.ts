export interface Series {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSeriesData {
  title: string;
  description?: string;
}