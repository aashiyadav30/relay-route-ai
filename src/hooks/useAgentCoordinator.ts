import { useState, useEffect, useCallback } from 'react';
import { Message, Driver, AgentLog, AgentAction, CoordinatorState } from '../types/coordinator';

// Mock data for demonstration
const mockDrivers: Driver[] = [
  {
    id: 'D001',
    name: 'Alex Chen',
    status: 'active',
    currentLocation: 'Downtown Mall',
    eta: '8 min',
    lastUpdate: '2 min ago',
    currentDelivery: 'ORD_12345'
  },
  {
    id: 'D002', 
    name: 'Sarah Kim',
    status: 'busy',
    currentLocation: 'Airport Terminal',
    eta: '15 min',
    lastUpdate: '1 min ago',
    currentDelivery: 'ORD_12346'
  },
  {
    id: 'D003',
    name: 'Mike Rodriguez',
    status: 'active',
    currentLocation: 'Central Station',
    eta: '12 min',
    lastUpdate: '30 sec ago'
  },
  {
    id: 'D004',
    name: 'Emma Walsh',
    status: 'active',
    currentLocation: 'Business District',
    eta: '6 min',
    lastUpdate: '45 sec ago',
    currentDelivery: 'ORD_12347'
  },
  {
    id: 'D005',
    name: 'David Park',
    status: 'offline',
    currentLocation: 'Service Center',
    eta: 'N/A',
    lastUpdate: '15 min ago'
  },
  {
    id: 'D006',
    name: 'Lisa Johnson',
    status: 'active',
    currentLocation: 'University Campus',
    eta: '9 min',
    lastUpdate: '1 min ago'
  },
  {
    id: 'D007',
    name: 'Tom Wilson',
    status: 'busy',
    currentLocation: 'Shopping Center',
    eta: '18 min',
    lastUpdate: '3 min ago',
    currentDelivery: 'ORD_12348'
  },
  {
    id: 'D008',
    name: 'Grace Martinez',
    status: 'active',
    currentLocation: 'Tech Park',
    eta: '11 min',
    lastUpdate: '1 min ago'
  },
  {
    id: 'D009',
    name: 'James Lee',
    status: 'active',
    currentLocation: 'Harbor View',
    eta: '14 min',
    lastUpdate: '2 min ago'
  },
  {
    id: 'D010',
    name: 'Nina Patel',
    status: 'busy',
    currentLocation: 'Medical Center',
    eta: '7 min',
    lastUpdate: '30 sec ago',
    currentDelivery: 'ORD_12349'
  }
];

const initialMessages: Message[] = [
  {
    id: 'msg_001',
    content: 'Hello! I\'m your AI Last-Mile Coordinator. I can help resolve delivery disruptions, track drivers, and coordinate real-time solutions. How can I assist you today?',
    sender: 'agent',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
  }
];

export const useAgentCoordinator = () => {
  const [state, setState] = useState<CoordinatorState>({
    messages: initialMessages,
    drivers: mockDrivers,
    orders: [],
    agentLogs: [],
    isProcessing: false
  });

  // Simulate real-time driver updates
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        drivers: prev.drivers.map(driver => ({
          ...driver,
          lastUpdate: Math.random() > 0.7 ? 'Just now' : driver.lastUpdate
        }))
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const addAgentLog = useCallback((log: Omit<AgentLog, 'id' | 'timestamp'>) => {
    const newLog: AgentLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      agentLogs: [...prev.agentLogs, newLog]
    }));

    return newLog;
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    return newMessage;
  }, []);

  const processDriverDelay = useCallback(async (customerId: string, message: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    // Add customer message
    addMessage({
      content: message,
      sender: 'user',
      priority: 'high'
    });

    // Simulate agent processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 1: Notify driver
    const driverLog = addAgentLog({
      type: 'driver_notification',
      action: 'Driver Notification Sent',
      description: `Notified driver D001: "Customer is waiting for you."`,
      metadata: { driverId: 'D001', customerId, notificationType: 'customer_waiting' }
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 2: Calculate alternative route
    const routeLog = addAgentLog({
      type: 'route_calculation',
      action: 'Alternative Route Calculated',
      description: 'Found shorter path via Main St, ETA reduced by 4 minutes',
      metadata: { originalETA: '8 min', newETA: '4 min', routeImprovement: '50%' }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Request driver to call customer
    const callLog = addAgentLog({
      type: 'driver_notification',
      action: 'Call Request Sent to Driver',
      description: 'Requested driver to call customer and explain situation',
      metadata: { driverId: 'D001', customerId, action: 'call_customer' }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Update customer
    const customerLog = addAgentLog({
      type: 'customer_update',
      action: 'Customer Notification Sent',
      description: 'Informed customer: Driver stuck in traffic, rerouting now',
      metadata: { customerId, reason: 'traffic', eta_update: '4 min' }
    });

    // Add agent response message
    addMessage({
      content: 'I\'ve immediately addressed your concern about the driver delay. Here\'s what I\'ve done:\n\n✓ Notified your driver about your inquiry\n✓ Calculated a faster alternative route (4 min savings)\n✓ Asked the driver to call you directly\n✓ Your driver is currently stuck in traffic but is now taking a shorter route\n\nNew estimated arrival: 4 minutes. Your driver should be calling you shortly to provide an update.',
      sender: 'agent',
      actions: [
        'Driver notified: D001',
        'Route optimized: 4 min faster',
        'Call requested to customer',
        'ETA updated: 4 minutes'
      ]
    });

    setState(prev => ({ ...prev, isProcessing: false }));
  }, [addMessage, addAgentLog]);

  const sendMessage = useCallback(async (content: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    // Add user message
    addMessage({
      content,
      sender: 'user'
    });

    // Simulate agent processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate appropriate response based on message content
    let response = '';
    let actions: string[] = [];

    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('status') || lowerContent.includes('order')) {
      response = 'I can see your order #ORD_12345 is currently being handled by driver Alex Chen. The order was picked up 15 minutes ago and is en route to your location. Current ETA is 8 minutes.';
      actions = ['Order status checked', 'Driver location verified'];
      
      addAgentLog({
        type: 'system',
        action: 'Order Status Query',
        description: 'Retrieved order status and driver information for customer',
        metadata: { orderId: 'ORD_12345', driverId: 'D001' }
      });
    } else if (lowerContent.includes('change') && lowerContent.includes('address')) {
      response = 'I can help you change your delivery address. However, since your order is already en route, I\'ll need to coordinate with your driver Alex Chen. This may result in a small additional fee and extended delivery time. Would you like me to proceed with the address change?';
      actions = ['Address change request initiated', 'Driver coordination required'];
      
      addAgentLog({
        type: 'system',
        action: 'Address Change Request',
        description: 'Customer requested delivery address change mid-route',
        metadata: { orderId: 'ORD_12345', status: 'pending_coordination' }
      });
    } else {
      response = 'I understand your concern. Let me analyze the situation and coordinate with our delivery network to provide you with the best solution. I\'m checking driver locations, traffic conditions, and alternative routes now.';
      actions = ['Situation analysis initiated', 'Network coordination in progress'];
      
      addAgentLog({
        type: 'system',
        action: 'General Inquiry Processing',
        description: 'Processing customer inquiry and analyzing delivery network',
        metadata: { inquiryType: 'general', processingStatus: 'active' }
      });
    }

    addMessage({
      content: response,
      sender: 'agent',
      actions
    });

    setState(prev => ({ ...prev, isProcessing: false }));
  }, [addMessage, addAgentLog]);

  return {
    messages: state.messages,
    drivers: state.drivers,
    orders: state.orders,
    agentLogs: state.agentLogs,
    isProcessing: state.isProcessing,
    sendMessage,
    processDriverDelay
  };
};