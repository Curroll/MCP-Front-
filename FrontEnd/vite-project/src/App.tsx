import React, { useState } from 'react';
import { Wallet, Users, Package, BarChart3, History, Bell } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import DashboardCard from './components/DashboardCard';
import WalletSection from './components/WalletSection';
import PartnersList from './components/PartnersList';
import OrdersOverview from './components/OrdersOverview';
import NotificationsPanel from './components/NotificationsPanel';
import AdvancedFeatures from './components/AdvancedFeatures';
import WorkflowOverview from './components/WorkflowOverview';
import { useDashboard } from './hooks/useDashboard';

function App() {
  const {
    data,
    partners,
    orders,
    notifications,
    addPartner,
    updateWallet,
    dismissNotification
  } = useDashboard();

  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">MCP Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button 
                className="text-gray-600 hover:text-gray-900 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                <History className="h-6 w-6" />
              </button>
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
      </header>

      {showNotifications && (
        <NotificationsPanel 
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workflow Overview */}
        <WorkflowOverview />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Wallet Balance"
            value={`₹${data.walletBalance.toLocaleString()}`}
            icon={<Wallet className="h-6 w-6" />}
            color="bg-blue-500"
          />
          <DashboardCard
            title="Total Partners"
            value={data.totalPartners}
            icon={<Users className="h-6 w-6" />}
            color="bg-green-500"
          />
          <DashboardCard
            title="Total Orders"
            value={data.totalOrders}
            icon={<Package className="h-6 w-6" />}
            color="bg-purple-500"
          />
          <DashboardCard
            title="Completion Rate"
            value={`${Math.round((data.completedOrders / data.totalOrders) * 100)}%`}
            icon={<BarChart3 className="h-6 w-6" />}
            color="bg-yellow-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Section */}
          <div className="lg:col-span-1">
            <WalletSection 
              balance={data.walletBalance}
              onAddFunds={(amount) => updateWallet(amount)}
              onWithdraw={(amount) => updateWallet(-amount)}
            />
          </div>

          {/* Partners List */}
          <div className="lg:col-span-2">
            <PartnersList
              partners={partners}
              onAddPartner={addPartner}
            />
          </div>
        </div>

        {/* Orders Overview */}
        <div className="mt-8">
          <OrdersOverview
            orders={orders}
            completed={data.completedOrders}
            pending={data.pendingOrders}
          />
        </div>

        {/* Advanced Features */}
        <AdvancedFeatures partners={partners} />
      </main>
    </div>
  );
}

export default App;