import React from 'react';
import { Bell, X } from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: 'order' | 'wallet' | 'partner';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onDismiss }) => {
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-50 border-blue-200';
      case 'wallet':
        return 'bg-yellow-50 border-yellow-200';
      case 'partner':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed right-4 top-20 w-96 bg-white rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        {notifications.length > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {notifications.length}
          </span>
        )}
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No new notifications</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative p-4 rounded-lg border ${getNotificationColor(notification.type)}`}
            >
              <button
                onClick={() => onDismiss(notification.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-gray-800 mb-2">{notification.message}</p>
              <p className="text-xs text-gray-500">
                {format(notification.timestamp, 'MMM d, h:mm a')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;