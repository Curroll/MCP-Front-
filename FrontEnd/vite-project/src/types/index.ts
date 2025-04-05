export interface Partner {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  orders: number;
  earnings: number;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Order {
  id: string;
  partnerId: string;
  customerName: string;
  status: 'pending' | 'in-progress' | 'completed';
  amount: number;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: 'order' | 'wallet' | 'partner';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface DashboardData {
  walletBalance: number;
  totalPartners: number;
  activePartners: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
}