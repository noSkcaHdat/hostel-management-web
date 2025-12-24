import { useState, useEffect } from 'react';
import { leaveAPI } from '../lib/api';
import { Clock, CheckCircle, XCircle, User, Calendar, FileText, AlertCircle } from 'lucide-react';

export default function WardenDashboard() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(new Set());

  useEffect(() => {
    fetchLeaves();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaves, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await leaveAPI.getPendingLeaves();
      setLeaves(response.data);
    } catch (err) {
      console.error('Error fetching pending leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessing((prev) => new Set(prev).add(id));
    try {
      await leaveAPI.approve(id);
      fetchLeaves();
    } catch (err) {
      console.error('Error approving leave:', err);
      alert(err.response?.data?.error || 'Failed to approve leave');
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this leave request?')) {
      return;
    }

    setProcessing((prev) => new Set(prev).add(id));
    try {
      await leaveAPI.reject(id);
      fetchLeaves();
    } catch (err) {
      console.error('Error rejecting leave:', err);
      alert(err.response?.data?.error || 'Failed to reject leave');
    } finally {
      setProcessing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Leave Requests</h1>
        <p className="text-gray-600 mt-1">Review and approve or reject student leave applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{leaves.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Leaves List */}
      {leaves.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">There are no pending leave requests at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leaves.map((leave) => {
            const isProcessing = processing.has(leave.id);
            return (
              <div
                key={leave.id}
                className="card hover:shadow-md transition-shadow border-l-4 border-l-yellow-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Student Info */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {leave.profiles?.email || 'Unknown Student'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Student ID: {leave.student_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          <strong>From:</strong>{' '}
                          {new Date(leave.from_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
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

                    {/* Reason */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Reason</p>
                          <p className="text-sm text-gray-700">{leave.reason}</p>
                        </div>
                      </div>
                    </div>

                    {/* Applied Date */}
                    <p className="text-xs text-gray-500">
                      Applied on{' '}
                      {new Date(leave.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleApprove(leave.id)}
                      disabled={isProcessing}
                      className="btn-primary flex items-center justify-center space-x-2 min-w-[120px]"
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(leave.id)}
                      disabled={isProcessing}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[120px]"
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

