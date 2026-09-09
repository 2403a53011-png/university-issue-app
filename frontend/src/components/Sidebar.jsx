import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListOrdered, 
  Bell, 
  User, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/raise-issue', label: 'Raise Issue', icon: PlusCircle },
    { to: '/student/my-issues', label: 'My Issues', icon: ListOrdered },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/student/profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/issues', label: 'All Issues', icon: FileSpreadsheet, exact: true },
    { to: '/admin/issues?status=Pending', label: 'Pending Issues', icon: Clock },
    { to: '/admin/issues?status=Resolved', label: 'Resolved Issues', icon: CheckCircle2 },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/admin/profile', label: 'Profile', icon: User },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const isLinkActive = (link) => {
    if (link.to.includes('?')) {
      return location.pathname + location.search === link.to;
    }
    if (link.exact) {
      return location.pathname === link.to && !location.search;
    }
    return location.pathname === link.to;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-10
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Mobile Header with Close */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 lg:hidden">
          <span className="font-bold text-white text-base">Navigation</span>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
              user?.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
            }`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
              <p className="text-[11px] text-slate-400 truncate">{user?.id}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] uppercase font-semibold text-emerald-300 tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Menu
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => onClose && onClose()}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
                  <span>{link.label}</span>
                </div>
                {link.badge > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    active ? 'bg-white text-blue-700' : 'bg-red-500 text-white'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Help & Logout Footer */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <div className="px-3 py-2 text-[11px] text-slate-400 flex items-center gap-2">
            <HelpCircle size={14} className="text-slate-500" />
            <span>Campus Support: ext 4040</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
