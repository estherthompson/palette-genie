import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface UserPaint {
  id?: string;
  name: string;
  brand: string;
  color: {
    rgb: number[];
    hex: string;
    hsl: number[];
    cmyk: number[];
    name: string;
    confidence: number;
    tier: string;
  };
  opacity: number;
  quantity: number;
  unit: string;
  cost_per_unit?: number;
  notes?: string;
}

export default function User() {
  const [userPaints, setUserPaints] = useState<UserPaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaint, setNewPaint] = useState({
    name: '',
    brand: '',
    hex: '#000000',
    quantity: 100,
    unit: 'ml',
    cost_per_unit: 0,
    notes: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchUserPaints();
  }, []);

  const fetchUserPaints = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/user/paints');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUserPaints(data.paints || []);
    } catch (err) {
      console.error('Error fetching user paints:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch paints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaint = async () => {
    try {
      // Convert hex to RGB for the API
      const hex = newPaint.hex.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      const paintData = {
        name: newPaint.name,
        brand: newPaint.brand,
        color: {
          rgb: [r, g, b],
          hex: newPaint.hex,
          hsl: [0, 0, 0], // Will be calculated by backend
          cmyk: [0, 0, 0, 0], // Will be calculated by backend
          name: newPaint.name,
          confidence: 1.0,
          tier: "dominant"
        },
        opacity: 1.0,
        quantity: newPaint.quantity,
        unit: newPaint.unit,
        cost_per_unit: newPaint.cost_per_unit,
        notes: newPaint.notes
      };

      const response = await fetch('http://localhost:8000/api/user/paints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paintData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset form and refresh paints
      setNewPaint({
        name: '',
        brand: '',
        hex: '#000000',
        quantity: 100,
        unit: 'ml',
        cost_per_unit: 0,
        notes: ''
      });
      setShowAddForm(false);
      fetchUserPaints();
    } catch (err) {
      console.error('Error adding paint:', err);
      setError(err instanceof Error ? err.message : 'Failed to add paint');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const totalValue = userPaints.reduce((sum, paint) => {
    return sum + (paint.cost_per_unit || 0) * paint.quantity;
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fef6e9] via-[#ffc6ac] to-[#faae7b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-700">Loading your paint collection...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Paint Collection - Palette Genie</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-[#fef6e9] via-[#ffc6ac] to-[#faae7b]">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/palette-genie.png"
                  alt="Palette Genie Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <h1 className="text-2xl font-bold text-gray-800">Palette Genie</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/home')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              My Paint Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Manage your personal paint collection and track your supplies for better color mixing
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-red-800">Error</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Collection Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{userPaints.length}</div>
                <div className="text-gray-600">Total Paints</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
                <div className="text-gray-600">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {userPaints.reduce((sum, paint) => sum + paint.quantity, 0).toFixed(0)}
                </div>
                <div className="text-gray-600">Total Quantity (ml)</div>
              </div>
            </div>
          </div>

          {/* Add Paint Button */}
          <div className="text-center mb-8">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 hover:shadow-lg transition-all"
            >
              {showAddForm ? 'Cancel' : 'Add New Paint'}
            </button>
          </div>

          {/* Add Paint Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Add New Paint</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paint Name</label>
                  <input
                    type="text"
                    value={newPaint.name}
                    onChange={(e) => setNewPaint({...newPaint, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Burnt Sienna"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <input
                    type="text"
                    value={newPaint.brand}
                    onChange={(e) => setNewPaint({...newPaint, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Northhaven"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={newPaint.hex}
                      onChange={(e) => setNewPaint({...newPaint, hex: e.target.value})}
                      className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newPaint.hex}
                      onChange={(e) => setNewPaint({...newPaint, hex: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={newPaint.quantity}
                      onChange={(e) => setNewPaint({...newPaint, quantity: parseFloat(e.target.value)})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="100"
                    />
                    <select
                      value={newPaint.unit}
                      onChange={(e) => setNewPaint({...newPaint, unit: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="ml">ml</option>
                      <option value="oz">oz</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cost per Unit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPaint.cost_per_unit}
                    onChange={(e) => setNewPaint({...newPaint, cost_per_unit: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.05"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <input
                    type="text"
                    value={newPaint.notes}
                    onChange={(e) => setNewPaint({...newPaint, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional notes"
                  />
                </div>
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={handleAddPaint}
                  disabled={!newPaint.name || !newPaint.brand}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    !newPaint.name || !newPaint.brand
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 hover:shadow-lg'
                  }`}
                >
                  Add Paint to Collection
                </button>
              </div>
            </div>
          )}

          {/* Paint Collection Grid */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Your Paints</h3>
            {userPaints.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="mt-4 text-gray-600">No paints in your collection yet</p>
                <p className="text-sm text-gray-500">Add your first paint to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPaints.map((paint, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div 
                        className="w-16 h-16 rounded-lg mr-4 shadow-md"
                        style={{ backgroundColor: paint.color.hex }}
                      ></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{paint.name}</h4>
                        <p className="text-sm text-gray-500">{paint.brand}</p>
                        <p className="text-xs text-gray-400">{paint.color.hex}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{paint.quantity} {paint.unit}</span>
                      </div>
                      {paint.cost_per_unit && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost:</span>
                          <span className="font-medium">${(paint.cost_per_unit * paint.quantity).toFixed(2)}</span>
                        </div>
                      )}
                      {paint.notes && (
                        <div className="text-xs text-gray-500 italic">{paint.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}