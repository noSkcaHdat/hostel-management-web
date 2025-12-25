import { AlertTriangle } from 'lucide-react';

export default function EnvWarning() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-center">
        <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
        <div>
          <p className="text-sm font-medium text-yellow-800">
            Supabase environment variables not configured
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Please create a <code className="bg-yellow-100 px-1 rounded">.env</code> file with{' '}
            <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
            <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code>
          </p>
        </div>
      </div>
    </div>
  );
}

//for supabase env variables configuration errors.