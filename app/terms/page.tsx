export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-12 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7l-7-5zM8 15v-3h4v3H8z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
                <p className="text-indigo-100 text-lg">Community guidelines and usage terms</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <p className="text-sm font-medium mb-1">📅 Effective Date: January 1, 2024</p>
              <p className="text-sm text-indigo-100">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              
              {/* Quick Summary */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-6 rounded-r-lg mb-8">
                <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Terms Summary
                </h3>
                <ul className="text-indigo-800 dark:text-indigo-200 space-y-2">
                  <li>✅ Respectful, Christian community standards</li>
                  <li>✅ Personal, non-commercial use permitted</li>
                  <li>✅ User-generated content must be appropriate</li>
                  <li>✅ Account security is your responsibility</li>
                  <li>✅ Donations are voluntary and non-refundable</li>
                </ul>
              </div>

              {/* Acceptable Use */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Community Standards
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      ✅ Encouraged Behavior
                    </h4>
                    <ul className="text-green-800 dark:text-green-200 space-y-2 text-sm">
                      <li>• Respectful Christian fellowship</li>
                      <li>• Constructive prayer requests</li>
                      <li>• Encouraging testimonies</li>
                      <li>• Appropriate event participation</li>
                      <li>• Helpful community engagement</li>
                      <li>• Biblical discussion and study</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-700">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      ❌ Prohibited Behavior
                    </h4>
                    <ul className="text-red-800 dark:text-red-200 space-y-2 text-sm">
                      <li>• Offensive or inappropriate content</li>
                      <li>• Harassment or discrimination</li>
                      <li>• Spam or commercial promotion</li>
                      <li>• False or misleading information</li>
                      <li>• Unauthorized system access</li>
                      <li>• Copyright infringement</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* User Responsibilities */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Your Responsibilities
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Account Security</h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">Maintain secure passwords, protect your login credentials, and notify us of any unauthorized access to your account.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">Content Accuracy</h4>
                      <p className="text-purple-700 dark:text-purple-300 text-sm">Provide truthful, accurate information in your profile, prayer requests, and all communications with the church community.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Respectful Communication</h4>
                      <p className="text-green-700 dark:text-green-300 text-sm">Communicate with kindness, respect, and Christian love in all interactions with fellow members and church staff.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Services & Features */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Service Terms
                </h2>
                
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Donations</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Voluntary, secure, and tax-deductible. All donations support our ministry and community outreach.</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Your personal information is protected according to our comprehensive Privacy Policy.</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Content</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">All content is provided for personal, non-commercial use under our usage license.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Legal & Contact */}
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2L3 7v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7l-7-5zM8 15v-3h4v3H8z" clipRule="evenodd" />
                    </svg>
                    Legal Information
                  </h3>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-2 text-sm">
                    <li>⚖️ Governed by state and federal law</li>
                    <li>📜 Terms may be updated periodically</li>
                    <li>🚫 Violations may result in account suspension</li>
                    <li>🛡️ Limited liability and disclaimers apply</li>
                    <li>🔗 External links not under our control</li>
                  </ul>
                </div>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <h3 className="text-xl font-semibold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Questions or Concerns?
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-indigo-800 dark:text-indigo-200">
                      <span className="font-medium w-16">Email:</span>
                      <a href="mailto:legal@salemprimitivebaptist.org" className="text-indigo-600 dark:text-indigo-400 hover:underline">legal@salemprimitivebaptist.org</a>
                    </div>
                    <div className="flex items-center text-indigo-800 dark:text-indigo-200">
                      <span className="font-medium w-16">Phone:</span>
                      <span>(555) 123-4567</span>
                    </div>
                    <div className="flex items-start text-indigo-800 dark:text-indigo-200">
                      <span className="font-medium w-16 mt-0.5">Address:</span>
                      <span>123 Church Street<br />Your City, State 12345</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Agreement Acceptance</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">By using our website, you agree to these terms and our Privacy Policy.</p>
                  </div>
                  <div className="flex space-x-3">
                    <a href="/privacy" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                      Privacy Policy
                    </a>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                      Contact Legal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}