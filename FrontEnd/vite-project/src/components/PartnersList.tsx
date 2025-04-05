import React, { useState } from 'react';
import { UserPlus, User } from 'lucide-react';
import { Partner } from '../types';

interface PartnersListProps {
  partners: Partner[];
  onAddPartner: (name: string) => void;
}

const PartnersList: React.FC<PartnersListProps> = ({ partners, onAddPartner }) => {
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');

  const handleAddPartner = () => {
    if (newPartnerName.trim()) {
      onAddPartner(newPartnerName.trim());
      setNewPartnerName('');
      setShowAddPartner(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Pickup Partners</h2>
        <button 
          onClick={() => setShowAddPartner(!showAddPartner)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add Partner
        </button>
      </div>

      {showAddPartner && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={newPartnerName}
            onChange={(e) => setNewPartnerName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Enter partner name"
          />
          <button
            onClick={handleAddPartner}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Add Partner
          </button>
        </div>
      )}

      <div className="space-y-4">
        {partners.map(partner => (
          <div key={partner.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">{partner.name}</h3>
                <p className="text-sm text-gray-500">{partner.orders} orders completed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">₹{partner.earnings.toLocaleString()}</p>
              <span className={`text-sm ${partner.status === 'active' ? 'text-green-500' : 'text-gray-500'}`}>
                {partner.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnersList;