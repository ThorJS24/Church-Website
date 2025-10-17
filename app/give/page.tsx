'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, CreditCard, Smartphone, Building, Users, Globe, BookOpen, Shield } from 'lucide-react';

const givingOptions = [
  {
    id: 'tithe',
    title: 'Tithe & Offerings',
    description: 'Regular giving to support our church ministries and operations',
    suggested: [500, 1000, 2500, 5000]
  },
  {
    id: 'missions',
    title: 'Missions Fund',
    description: 'Support our global mission work and local outreach programs',
    suggested: [250, 500, 1000, 2500]
  },
  {
    id: 'building',
    title: 'Building Fund',
    description: 'Help us maintain and improve our church facilities',
    suggested: [1000, 2500, 5000, 10000]
  },
  {
    id: 'special',
    title: 'Special Projects',
    description: 'Support specific ministry projects and community initiatives',
    suggested: [500, 1000, 2500, 5000]
  }
];

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'upi', name: 'UPI Payment', icon: Smartphone },
  { id: 'bank', name: 'Bank Transfer', icon: Building }
];

const impactAreas = [
  {
    icon: Users,
    title: 'Community Outreach',
    description: 'Supporting families in need through food drives, counseling, and assistance programs.',
    amount: '₹2,50,000'
  },
  {
    icon: Globe,
    title: 'Global Missions',
    description: 'Spreading the Gospel worldwide through missionary support and evangelism.',
    amount: '₹5,00,000'
  },
  {
    icon: BookOpen,
    title: 'Education Ministry',
    description: 'Providing quality Christian education and scholarship programs.',
    amount: '₹3,00,000'
  },
  {
    icon: Heart,
    title: 'Youth Programs',
    description: 'Investing in the next generation through camps, mentorship, and activities.',
    amount: '₹1,50,000'
  }
];

export default function GivePage() {
  const [selectedFund, setSelectedFund] = useState('tithe');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isRecurring, setIsRecurring] = useState(false);
  const [donationStatus, setDonationStatus] = useState<'idle' | 'success'>('idle');
  
  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    // Simulate donation process
    setTimeout(() => {
      setDonationStatus('success');
    }, 1000);
  };

  const selectedOption = givingOptions.find(option => option.id === selectedFund);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Give with Joy
          </motion.h1>
          <motion.p 
            className="text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your generosity helps us serve our community and spread God's love
          </motion.p>
        </div>
      </section>

      {/* Giving Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Giving Options */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-6">Choose Your Giving</h2>
                
                <div className="space-y-4 mb-8">
                  {givingOptions.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedFund(option.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedFund === option.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h3 className="font-bold text-lg mb-2">{option.title}</h3>
                      <p className="text-gray-600 text-sm">{option.description}</p>
                    </div>
                  ))}
                </div>

                {/* Amount Selection */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-4">Select Amount (₹)</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {selectedOption?.suggested.map((suggestedAmount) => (
                      <button
                        key={suggestedAmount}
                        onClick={() => setAmount(suggestedAmount.toString())}
                        className={`p-3 border-2 rounded-lg font-semibold transition-colors ${
                          amount === suggestedAmount.toString()
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        ₹{suggestedAmount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Enter custom amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Recurring Option */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="mr-3 w-4 h-4 text-blue-600"
                    />
                    <span className="font-semibold">Make this a recurring monthly gift</span>
                  </label>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-6">Payment Method</h2>
                
                <div className="space-y-4 mb-8">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors flex items-center ${
                        paymentMethod === method.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <method.icon className="w-6 h-6 mr-3 text-blue-600" />
                      <span className="font-semibold">{method.name}</span>
                    </div>
                  ))}
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Secure Payment</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    Your payment information is encrypted and secure. We never store your payment details.
                  </p>
                </div>

                {/* Give Button */}
                <button 
                  onClick={handleDonate}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  disabled={!amount}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Give ₹{amount ? parseInt(amount).toLocaleString() : '0'}{isRecurring ? ' Monthly' : ''}
                </button>
                
                {donationStatus === 'success' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Thank You!</h4>
                    <p className="text-green-700 text-sm">Your generous gift has been received. God bless you!</p>
                  </div>
                )}

                <p className="text-center text-gray-600 text-sm mt-4">
                  By clicking "Give", you agree to our terms and conditions. All donations are secure and encrypted.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Your Impact</h2>
            <p className="text-gray-600">See how your generosity is making a difference in our community</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactAreas.map((area, index) => (
              <motion.div 
                key={area.title}
                className="text-center p-6 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <area.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">{area.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{area.description}</p>
                <div className="text-2xl font-bold text-blue-600">{area.amount}</div>
                <div className="text-sm text-gray-500">raised this year</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Give Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-8">Why We Give</h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="p-6">
                  <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Worship Through Giving</h3>
                  <p className="text-gray-600">Giving is an act of worship that acknowledges God as the source of all blessings.</p>
                </div>
                
                <div className="p-6">
                  <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Support Our Mission</h3>
                  <p className="text-gray-600">Your gifts enable us to serve our community and spread the Gospel effectively.</p>
                </div>
                
                <div className="p-6">
                  <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">Make a Difference</h3>
                  <p className="text-gray-600">Together, we can transform lives and communities through God's love and grace.</p>
                </div>
              </div>

              <blockquote className="text-xl italic text-gray-700 mb-4">
                "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
              </blockquote>
              <cite className="text-blue-600 font-semibold">2 Corinthians 9:7</cite>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Other Ways to Give */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Other Ways to Give</h2>
            <p className="text-gray-600">Multiple convenient options for your generosity</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div 
              className="text-center p-6 border border-gray-200 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Building className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Bank Transfer</h3>
              <p className="text-gray-600 mb-4">Direct bank transfer for larger donations</p>
              <button className="text-blue-600 font-semibold hover:underline">
                Get Bank Details
              </button>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 border border-gray-200 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">In-Person</h3>
              <p className="text-gray-600 mb-4">Give during our worship services</p>
              <button className="text-blue-600 font-semibold hover:underline">
                Service Times
              </button>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 border border-gray-200 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Planned Giving</h3>
              <p className="text-gray-600 mb-4">Legacy gifts and estate planning</p>
              <button className="text-blue-600 font-semibold hover:underline">
                Learn More
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Questions About Giving?</h2>
            <p className="text-xl mb-8">We're here to help you with your generosity journey</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Contact Finance Team
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                View Giving FAQ
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}