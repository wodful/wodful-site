export interface EventResponse {
  accessCode: string;
  startDate: string;
  endDate: string;
  banner: string;
  address: string;
  name: string;
  description: string | null;
  tickets: Ticket[];
  isFinished: boolean;
}

export interface Ticket {
  id: string;
  description: string;
  price: string;
  name: string;
  category: Category;
}

interface Category {
  isTeam: string;
  members: number;
}

export interface TshirtSizeResponse {
  hasNameInTshirt: string;
  hasTshirt: string;
  tShirtSizes: string[];
}
