export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  actions?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Driver {
  id: string;
  name: string;
  status: 'active' | 'busy' | 'offline';
  currentLocation: string;
  eta: string;
  lastUpdate: string;
  currentDelivery?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AgentLog {
  id: string;
  timestamp: Date;
  type: 'driver_notification' | 'route_calculation' | 'customer_update' | 'error' | 'success' | 'system';
  action: string;
  description: string;
  metadata?: Record<string, any>;
  driverId?: string;
  customerId?: string;
}

export interface DeliveryOrder {
  id: string;
  customerId: string;
  driverId?: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  pickupLocation: string;
  deliveryLocation: string;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface AgentAction {
  type: 'notify_driver' | 'calculate_route' | 'notify_customer' | 'escalate' | 'update_eta';
  driverId?: string;
  customerId?: string;
  message?: string;
  metadata?: Record<string, any>;
}

export interface CoordinatorState {
  messages: Message[];
  drivers: Driver[];
  orders: DeliveryOrder[];
  agentLogs: AgentLog[];
  isProcessing: boolean;
  lastAgentAction?: AgentAction;
}