import React, { useState } from 'react';
import { PlusCircle, MinusCircle, ArrowUpRight } from 'lucide-react';

interface WalletSectionProps {
  balance: number;
  onAddFunds: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

const WalletSection: React.FC<WalletSectionProps> = ({ balance, onAddFunds, onWithdraw }) => {
  const [amount, setAmount] = useState<number>(0);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const handleTransaction = (type: 'add' | 'withdraw') => {
    if (amount <= 0) return;
    
    if (type === 'withdraw' && amount > balance) {
      alert('Insufficient balance');
      return;
    }

    if (type === 'add') {
      onAddFunds(amount);
    } else {
      onWithdraw(amount);
    }

    setAmount(0);
    setShowAddFunds(false);
    setShowWithdraw(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet</h2>
      
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-6">
        <p className="text-sm opacity-90">Available Balance</p>
        <p className="text-3xl font-bold">₹{balance.toLocaleString()}</p>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => {
            setShowAddFunds(!showAddFunds);
            setShowWithdraw(false);
          }}
          className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center">
            <PlusCircle className="h-5 w-5 mr-3" />
            <span>Add Funds</span>
          </div>
          <ArrowUpRight className="h-5 w-5" />
        </button>

        {showAddFunds && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2 border rounded mb-2"
              placeholder="Enter amount"
            />
            <button
              onClick={() => handleTransaction('add')}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Add Funds
            </button>
          </div>
        )}

        <button 
          onClick={() => {
            setShowWithdraw(!showWithdraw);
            setShowAddFunds(false);
          }}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center">
            <MinusCircle className="h-5 w-5 mr-3" />
            <span>Withdraw</span>
          </div>
          <ArrowUpRight className="h-5 w-5" />
        </button>

        {showWithdraw && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2 border rounded mb-2"
              placeholder="Enter amount"
            />
            <button
              onClick={() => handleTransaction('withdraw')}
              className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
            >
              Withdraw
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletSection;