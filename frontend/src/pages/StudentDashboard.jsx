import { useState, useEffect } from 'react';
import { leaveAPI } from '../lib/api';
import { Calendar, Plus, Clock, CheckCircle, XCircle, FileText, QrCode, X } from 'lucide-react';

export default function StudentDashboard() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    from_date: '',
    to_date: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Gate pass states
  const [selectedGatePass, setSelectedGatePass] = useState(null);
  const [loadingGatePass, setLoadingGatePass] = useState(false);
  const [gatePassError, setGatePassError] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await leaveAPI.getMyLeaves();
      setLeaves(response.data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await leaveAPI.apply(formData);
      setFormData({ from_date: '', to_date: '', reason: '' });
      setShowForm(false);
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply for leave');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewGatePass = async (leaveId) => {
    setLoadingGatePass(true);
    setGatePassError('');
    try {
      const response = await leaveAPI.getGatePass(leaveId);
      setSelectedGatePass(response.data);
    } catch (err) {
      setGatePassError(err.response?.data?.error || 'Failed to load gate pass');
    } finally {
      setLoadingGatePass(false);
    }
  };

  const getStatusIcon = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leave Requests</h1>
          <p className="text-gray-600 mt-1">View and manage your leave applications</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Apply Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>New Leave Application</span>
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">From Date</label>
                <input
                  type="date"
                  value={formData.from_date}
                  onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                  className="input-field"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="label">To Date</label>
                <input
                  type="date"
                  value={formData.to_date}
                  onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                  className="input-field"
                  required
                  disabled={submitting}
                  min={formData.from_date}
                />
              </div>
            </div>

            <div>
              <label className="label">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="input-field"
                rows="4"
                placeholder="Please provide a reason for your leave..."
                required
                disabled={submitting}
              />
            </div>

            <div className="flex space-x-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ from_date: '', to_date: '', reason: '' });
                  setError('');
                }}
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leaves List */}
      {leaves.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests yet</h3>
          <p className="text-gray-600 mb-4">Apply for your first leave to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Apply for Leave
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {leaves.map((leave) => (
            <div key={leave.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(leave.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        leave.status
                      )}`}
                    >
                      {leave.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>From:</strong>{' '}
                        {new Date(leave.from_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>To:</strong>{' '}
                        {new Date(leave.to_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <strong>Reason:</strong> {leave.reason}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    Applied on{' '}
                    {new Date(leave.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>

                  {/* View Gate Pass Button - Only for Approved Leaves */}
                  {leave.status === 'APPROVED' && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleViewGatePass(leave.id)}
                        disabled={loadingGatePass}
                        className="btn-primary flex items-center space-x-2 w-full md:w-auto"
                      >
                        {loadingGatePass ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4" />
                            <span>View Gate Pass</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gate Pass Modal */}
      {selectedGatePass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <QrCode className="w-6 h-6 text-primary-600" />
                  <span>Gate Pass</span>
                </h2>
                <button
                  onClick={() => {
                    setSelectedGatePass(null);
                    setGatePassError('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {gatePassError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {gatePassError}
                </div>
              )}

              <div className="space-y-4">
                {/* Pass Code - Highlighted */}
                <div className="p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                  <p className="text-xs font-medium text-primary-700 mb-2 uppercase tracking-wide">
                    Pass Code
                  </p>
                  <p className="text-3xl font-bold text-primary-900 font-mono text-center tracking-wider">
                    {selectedGatePass.pass_code}
                  </p>
                </div>

                {/* Status and Issue Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {selectedGatePass.status}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">Issued At</p>
                    <p className="text-sm text-gray-700">
                      {new Date(selectedGatePass.issued_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedGatePass.issued_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Used At - Only if used */}
                {selectedGatePass.used_at && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs font-medium text-yellow-700 mb-1">Used At</p>
                    <p className="text-sm text-yellow-900">
                      {new Date(selectedGatePass.used_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}

                {/* Instructions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-800 font-medium mb-1">📋 Instructions</p>
                    <p className="text-xs text-blue-700">
                      Show this gate pass code at the hostel gate when leaving. The security will verify and mark it as used.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}