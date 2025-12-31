
export enum Category {
  MOUSEPAD = 'MOUSEPAD',
  PHONECASE = 'PHONECASE',
  BEDDING = 'BEDDING',
  TSHIRT = 'TSHIRT'
}

export interface User {
  phone: string;
  points: number;
  gold: number;
  isLoggedIn: boolean;
}

export interface DesignState {
  artworkUrl: string | null;
  mockupUrls: string[]; 
  prompt: string;
  style: string;
  refImage: string | null;
  category: Category;
  aspectRatio: string;
  textToOverlay?: string;
  sourceArtworkId?: string;
}

export interface SavedArtwork {
  id: string;
  url: string;
  prompt: string;
  category: Category;
  timestamp: number;
  isPublic: boolean;
  likes: number;
  creator: string;
  orderCount: number;
}

export interface CartItem {
  id: string;
  image: string;
  prompt: string;
  category: Category;
  timestamp: number;
}

export enum AppLayer {
  DESIGN = 'DESIGN',
  PRODUCT = 'PRODUCT',
  GALLERY = 'GALLERY', 
  TRACKING = 'TRACKING'
}

export interface OrderStatus {
  id: string;
  category: Category;
  productName: string;
  status: 'PENDING' | 'PRODUCING' | 'QUALITY_CHECK' | 'SHIPPING' | 'TRANSIT' | 'DELIVERED';
  timestamp: string;
  image: string;
  sourceArtworkId?: string;
  logistics: {
    step: number; // 0: 下单, 1: 生产, 2: 质检, 3: 出货, 4: 签收
    updates: { time: string; msg: string }[];
  };
}
