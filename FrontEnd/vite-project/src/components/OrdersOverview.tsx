import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { Order } from '../types';
import { format } from 'date-fns';

interface OrdersOverviewProps {
  orders: Order[];
  completed: number;
  pending: number;
}

const OrdersOverview: React.FC<OrdersOverviewProps> = ({ orders, completed, pending }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Orders Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-green-600">Completed Orders</p>
              <p className="text-2xl font-semibold text-green-700">{completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm text-yellow-600">Pending Orders</p>
              <p className="text-2xl font-semibold text-yellow-700">{pending}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm text-gray-900">#{order.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.customerName}</td>
                <td className="px-4 py-3 text-sm text-gray-900">₹{order.amount}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {format(order.timestamp, 'MMM d, h:mm a')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersOverview;