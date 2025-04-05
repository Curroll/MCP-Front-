import React from 'react';
import { UserPlus, ClipboardList, Bell, CheckCircle, Wallet } from 'lucide-react';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'upcoming';
}

const WorkflowOverview: React.FC = () => {
  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: 'Partner Registration',
      description: 'MCP adds partners who register via Partner App',
      icon: <UserPlus className="h-6 w-6" />,
      status: 'completed'
    },
    {
      id: 2,
      title: 'Order Assignment',
      description: 'Orders are assigned manually or auto-assigned',
      icon: <ClipboardList className="h-6 w-6" />,
      status: 'current'
    },
    {
      id: 3,
      title: 'Partner Notification',
      description: 'Partner receives and accepts order',
      icon: <Bell className="h-6 w-6" />,
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Order Completion',
      description: 'Updates reflect in MCP dashboard',
      icon: <CheckCircle className="h-6 w-6" />,
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'Payment Processing',
      description: 'MCP transfers payment via wallet',
      icon: <Wallet className="h-6 w-6" />,
      status: 'upcoming'
    }
  ];

  const getStepStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  const getLineStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500';
      case 'current':
        return 'border-blue-500';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Workflow</h2>
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStepStyle(step.status)}`}>
                {step.icon}
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
                <p className="mt-1 text-xs text-gray-500 max-w-[120px]">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`absolute top-6 left-12 w-full border-t-2 ${getLineStyle(step.status)}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowOverview;