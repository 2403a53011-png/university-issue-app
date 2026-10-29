import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  ShieldCheck, 
  User, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Smartphone,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InstallAppModal from '../components/InstallAppModal';

export default function Login() {
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (role) => {
    setActiveTab(role);
    setError('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password, activeTab);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative ambient background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight">Apex State University</h1>
            <p className="text-xs text-blue-200/80">Issue & Requirement Management System</p>
          </div>
        </div>

        <button
          onClick={() => setShowInstallModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-200 bg-blue-900/50 hover:bg-blue-800/60 border border-blue-700/50 transition-colors"
        >
          <Smartphone size={15} />
          <span>Mobile APK / App</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto z-10 my-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100/10 p-6 sm:p-8 backdrop-blur-xl">
          
          {/* Role Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('student')}
              className={`py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'student'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User size={16} />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={`py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={16} />
              <span>Admin Portal</span>
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {activeTab === 'student' ? 'Student Sign In' : 'Administrator Sign In'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === 'student'
                ? 'Enter your Student ID and university credentials'
                : 'Enter your administrative credentials to manage campus issues'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {activeTab === 'student' ? 'Student ID / Username' : 'Admin ID / Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeTab === 'student' ? 'e.g. STU-2024-001 or student1' : 'e.g. admin or ADM-2024-001'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                activeTab === 'student'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
              } disabled:opacity-50`}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto text-center text-xs text-slate-400 z-10">
        <p>© 2026 Apex State University. All rights reserved.</p>
        <p className="text-[11px] text-slate-500 mt-1">Official Student Affairs & Campus Facilities Management Portal</p>
      </div>

      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
}
