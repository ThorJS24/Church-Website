export interface Speaker {
  id: string;
  name: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpeakerData {
  name: string;
  image?: string;
}