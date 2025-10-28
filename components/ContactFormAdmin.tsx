'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, Mail, Phone, Clock, User, MessageSquare, 
  Filter, Search, ChevronDown, CheckCircle, XCircle 
} from 'lucide-react';

interface ContactSubmission {
  _id: string;
  formType: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  urgency: string;
  status: string;
  submittedAt: string;
  ministry?: string;
  eventType?: string;
  donationType?: string;
  organizationType?: string;
  mediaType?: string;
}

export default function ContactFormAdmin() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/contact/admin');
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/contact/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      
      if (response.ok) {
        setSubmissions(prev => 
          prev.map(sub => sub._id === id ? { ...sub, status } : sub)
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesFilter = filter === 'all' || sub.formType === filter || sub.status === filter;
    const matchesSearch = searchTerm === '' || 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Contact Form Submissions
        </h2>
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Forms</option>
            <option value="general">General</option>
            <option value="prayer">Prayer</option>
            <option value="volunteer">Volunteer</option>
            <option value="baptism">Baptism</option>
            <option value="facility">Facility</option>
            <option value="donations">Donations</option>
            <option value="new">New</option>
            <option value="progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredSubmissions.map((submission) => (
          <motion.div
            key={submission._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {submission.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                  {submission.urgency !== 'normal' && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(submission.urgency)}`}>
                      {submission.urgency}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {submission.email}
                  </span>
                  {submission.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {submission.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Form Type: 
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1 capitalize">
                    {submission.formType}
                  </span>
                </div>
                
                {submission.subject && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject: 
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                      {submission.subject}
                    </span>
                  </div>
                )}
                
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {submission.message}
                </p>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setSelectedSubmission(submission)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                
                <select
                  value={submission.status}
                  onChange={(e) => updateStatus(submission._id, e.target.value)}
                  className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="new">New</option>
                  <option value="progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No submissions found matching your criteria.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Submission Details
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <p className="text-gray-900 dark:text-white">{selectedSubmission.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Form Type</label>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedSubmission.formType}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p className="text-gray-900 dark:text-white">{selectedSubmission.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <p className="text-gray-900 dark:text-white">{selectedSubmission.phone || 'Not provided'}</p>
                </div>
              </div>
              
              {selectedSubmission.subject && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                  <p className="text-gray-900 dark:text-white">{selectedSubmission.subject}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Urgency</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(selectedSubmission.urgency)}`}>
                    {selectedSubmission.urgency}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Submitted</label>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}