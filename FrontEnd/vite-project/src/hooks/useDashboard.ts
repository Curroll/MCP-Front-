import { useState, useEffect } from 'react';
import { faker } from '@faker-js/faker';
import { DashboardData, Partner, Order, Notification } from '../types';

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    walletBalance: 25000,
    totalPartners: 12,
    activePartners: 8,
    totalOrders: 156,
    completedOrders: 142,
    pendingOrders: 14
  });

  const [partners, setPartners] = useState<Partner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize mock data
  useEffect(() => {
    // Generate partners
    const mockPartners = Array.from({ length: data.totalPartners }, () => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      status: faker.helpers.arrayElement(['active', 'inactive']) as 'active' | 'inactive',
      orders: faker.number.int({ min: 10, max: 100 }),
      earnings: faker.number.int({ min: 5000, max: 50000 }),
      location: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude()
      }
    }));
    setPartners(mockPartners);

    // Generate orders
    const mockOrders = Array.from({ length: 10 }, () => ({
      id: faker.string.uuid(),
      partnerId: faker.helpers.arrayElement(mockPartners).id,
      customerName: faker.person.fullName(),
      status: faker.helpers.arrayElement(['pending', 'in-progress', 'completed']) as 'pending' | 'in-progress' | 'completed',
      amount: faker.number.int({ min: 100, max: 1000 }),
      timestamp: faker.date.recent()
    }));
    setOrders(mockOrders);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update partner status
      if (Math.random() > 0.7) {
        setPartners(current => {
          const updated = [...current];
          const randomIndex = Math.floor(Math.random() * updated.length);
          updated[randomIndex] = {
            ...updated[randomIndex],
            status: updated[randomIndex].status === 'active' ? 'inactive' : 'active'
          };
          return updated;
        });
      }

      // Randomly add new order
      if (Math.random() > 0.8) {
        const newOrder = {
          id: faker.string.uuid(),
          partnerId: faker.helpers.arrayElement(partners).id,
          customerName: faker.person.fullName(),
          status: 'pending' as const,
          amount: faker.number.int({ min: 100, max: 1000 }),
          timestamp: new Date()
        };

        setOrders(current => [newOrder, ...current]);
        setData(current => ({
          ...current,
          totalOrders: current.totalOrders + 1,
          pendingOrders: current.pendingOrders + 1
        }));

        // Add notification
        const notification: Notification = {
          id: faker.string.uuid(),
          type: 'order',
          message: `New order #${newOrder.id.slice(0, 8)} assigned to ${
            partners.find(p => p.id === newOrder.partnerId)?.name
          }`,
          timestamp: new Date(),
          read: false
        };
        setNotifications(current => [notification, ...current]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [partners]);

  const addPartner = (name: string) => {
    const newPartner: Partner = {
      id: faker.string.uuid(),
      name,
      status: 'active',
      orders: 0,
      earnings: 0,
      location: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude()
      }
    };

    setPartners(current => [...current, newPartner]);
    setData(current => ({
      ...current,
      totalPartners: current.totalPartners + 1,
      activePartners: current.activePartners + 1
    }));

    const notification: Notification = {
      id: faker.string.uuid(),
      type: 'partner',
      message: `New partner ${name} has been added`,
      timestamp: new Date(),
      read: false
    };
    setNotifications(current => [notification, ...current]);
  };

  const updateWallet = (amount: number) => {
    setData(current => ({
      ...current,
      walletBalance: current.walletBalance + amount
    }));

    const notification: Notification = {
      id: faker.string.uuid(),
      type: 'wallet',
      message: amount > 0 
        ? `Added ₹${amount.toLocaleString()} to wallet`
        : `Withdrawn ₹${Math.abs(amount).toLocaleString()} from wallet`,
      timestamp: new Date(),
      read: false
    };
    setNotifications(current => [notification, ...current]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(current => current.filter(n => n.id !== id));
  };

  return {
    data,
    partners,
    orders,
    notifications,
    addPartner,
    updateWallet,
    dismissNotification
  };
};