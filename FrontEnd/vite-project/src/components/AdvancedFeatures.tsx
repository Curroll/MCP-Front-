import React from 'react';
import { Trophy, TrendingUp, MapPin, Brain } from 'lucide-react';
import { Partner } from '../types';

interface AdvancedFeaturesProps {
  partners: Partner[];
}

const AdvancedFeatures: React.FC<AdvancedFeaturesProps> = ({ partners }) => {
  // Sort partners by orders for leaderboard
  const topPartners = [...partners]
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  // Calculate projected earnings based on current month's data
  const projectedEarnings = partners.reduce((sum, partner) => sum + partner.earnings, 0) * 1.2;

  const features = [
    {
      title: 'AI-Powered Allocation',
      description: 'Smart order assignment based on partner performance and location',
      icon: <Brain className="h-6 w-6" />,
      stats: '95% efficiency increase',
      content: (
        <div className="mt-2 text-sm">
          <p className="text-gray-600">Active learning from:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Partner performance history</li>
            <li>Location-based assignments</li>
            <li>Time-based optimization</li>
          </ul>
        </div>
      )
    },
    {
      title: 'Live GPS Tracking',
      description: 'Real-time location tracking of all pickup partners',
      icon: <MapPin className="h-6 w-6" />,
      stats: `${partners.filter(p => p.status === 'active').length} partners online`,
      content: (
        <div className="mt-2">
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-sm text-gray-500">Map view available</p>
          </div>
        </div>
      )
    },
    {
      title: 'Partner Leaderboard',
      description: 'Top performing partners this month',
      icon: <Trophy className="h-6 w-6" />,
      stats: 'Top 5 visible',
      content: (
        <div className="mt-2">
          {topPartners.map((partner, index) => (
            <div key={partner.id} className="flex items-center justify-between text-sm py-1">
              <span className="text-gray-600">#{index + 1} {partner.name}</span>
              <span className="font-medium">{partner.orders} orders</span>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Earnings Projection',
      description: 'Estimated earnings based on current performance',
      icon: <TrendingUp className="h-6 w-6" />,
      stats: `₹${Math.round(projectedEarnings).toLocaleString()} projected`,
      content: (
        <div className="mt-2">
          <div className="h-32 bg-gray-100 rounded-lg p-2">
            <div className="h-full flex items-end space-x-1">
              {[0.6, 0.8, 0.4, 0.9, 0.7, 0.5, 0.8].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-500 opacity-75"
                  style={{ height: `${height * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Advanced Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-500 rounded-lg">
                  {React.cloneElement(feature.icon, { className: 'h-6 w-6 text-white' })}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-base font-medium text-gray-900">{feature.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                <p className="mt-2 text-sm font-medium text-blue-600">{feature.stats}</p>
                {feature.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvancedFeatures;