import { useState } from 'react';
import { gatePassAPI } from '../lib/api';
import { QrCode, Search, CheckCircle, XCircle, User, Calendar, Clock, AlertCircle } from 'lucide-react';

export default function GatePassVerification() {
  const [code, setCode] = useState('');
  const [gatePass, setGatePass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [using, setUsing] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setGatePass(null);
    setLoading(true);

    try {
      const response = await gatePassAPI.verify(code);
      setGatePass(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid gate pass code');
      setGatePass(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUse = async () => {
    if (!gatePass || gatePass.status === 'used') return;

    if (!confirm('Mark this gate pass as used?')) {
      return;
    }

    setUsing(true);
    try {
      await gatePassAPI.use(gatePass.pass_code);
      // Refresh gate pass data
      const response = await gatePassAPI.verify(gatePass.pass_code);
      setGatePass(response.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark gate pass as used');
    } finally {
      setUsing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gate Pass Verification</h1>
        <p className="text-gray-600 mt-1">Verify and manage student gate passes</p>
      </div>

      {/* Search Form */}
      <div className="card">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="label">Gate Pass Code</label>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter gate pass code (e.g., GP-xxxx-xxxx)"
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !code}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Gate Pass Details */}
      {gatePass && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Gate Pass Details</h2>
            <div className="flex items-center space-x-2">
              {gatePass.status === 'used' ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>USED</span>
                </span>
              ) : (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>ISSUED</span>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Pass Code */}
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-xs font-medium text-primary-700 mb-1">Pass Code</p>
              <p className="text-2xl font-bold text-primary-900 font-mono">{gatePass.pass_code}</p>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="text-xs font-medium text-gray-500">Student</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {gatePass.student?.email || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {gatePass.student?.id?.slice(0, 8)}...
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-xs font-medium text-gray-500">Leave Period</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(gatePass.leave_from).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  -{' '}
                  {new Date(gatePass.leave_to).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 mb-2">Reason</p>
              <p className="text-sm text-gray-700">{gatePass.reason}</p>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">Issued At</p>
                <p className="text-sm text-gray-700">
                  {new Date(gatePass.issued_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {gatePass.used_at && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Used At</p>
                  <p className="text-sm text-gray-700">
                    {new Date(gatePass.used_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            {gatePass.status !== 'used' && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleUse}
                  disabled={using}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {using ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Marking as used...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Used</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

