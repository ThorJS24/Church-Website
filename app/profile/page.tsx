'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    interests: []
  });
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    setFormData({
      firstName: parsed.firstName || '',
      lastName: parsed.lastName || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      address: parsed.address || '',
      dateOfBirth: parsed.dateOfBirth ? parsed.dateOfBirth.split('T')[0] : '',
      interests: parsed.interests || []
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        const updatedUser = { ...user, ...formData, name: `${formData.firstName} ${formData.lastName}` };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      alert('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.photoURL ? (
                    <Image src={user.photoURL} alt="Profile" width={80} height={80} className="object-cover rounded-full" />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-white">
                    {formData.firstName} {formData.lastName}
                  </h1>
                  <p className="text-blue-100">{formData.email}</p>
                  <p className="text-blue-200 text-sm">Member since {new Date(user.memberSince || user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    {isEditing ? (
                      <div className="flex space-x-2 flex-1">
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Last Name"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">
                        {formData.firstName} {formData.lastName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">{formData.email}</span>
                  </div>

                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Phone Number"
                      />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">{formData.phone || 'Not provided'}</span>
                    )}
                  </div>

                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Address"
                      />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">{formData.address || 'Not provided'}</span>
                    )}
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300">
                        {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Church Involvement
                </h3>
                <div className="space-y-3 mb-6">
                  {formData.interests.length > 0 ? (
                    formData.interests.map((interest, index) => (
                      <div key={index} className="bg-blue-50 dark:bg-blue-900 px-3 py-2 rounded-lg">
                        <span className="text-blue-700 dark:text-blue-300">{interest}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No interests selected</p>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Membership Info
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(user.memberSince || user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {user.status || 'Active Member'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Role:</span>
                    <span className="text-gray-900 dark:text-white capitalize">{user.role || 'Member'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Login:</span>
                    <span className="text-gray-900 dark:text-white">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'First time'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}