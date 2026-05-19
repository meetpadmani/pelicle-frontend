import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Heart, MapPin, Settings, LogOut } from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice';

const DashboardHome = () => {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const menu = [
    { label: 'My Orders', icon: Package, href: '/dashboard/orders', desc: 'Track, return, or buy things again' },
    { label: 'Wishlist', icon: Heart, href: '/dashboard/wishlist', desc: 'Your saved items' },
    { label: 'Addresses', icon: MapPin, href: '/dashboard/addresses', desc: 'Manage your delivery addresses' },
    { label: 'Profile Settings', icon: Settings, href: '/dashboard/profile', desc: 'Update your personal info' },
  ];

  return (
    <div className="container-custom py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-olive-green flex items-center justify-center text-white text-xl font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-500">Hello,</p>
                <h2 className="font-bold text-deep-forest truncate">{user?.name}</h2>
              </div>
            </div>
            <nav className="space-y-1">
              {menu.map(({ label, icon: Icon, href }) => (
                <Link key={label} to={href} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-olive-green transition-colors">
                  <Icon size={18} /> {label}
                </Link>
              ))}
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors mt-2">
                <LogOut size={18} /> Log Out
              </button>
            </nav>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-deep-forest mb-6">Your Account</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menu.map(({ label, icon: Icon, href, desc }) => (
              <Link key={label} to={href} className="card p-6 flex items-start gap-4 hover:border-brand-300 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-olive-green group-hover:bg-light-beige transition-colors">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-deep-forest mb-1">{label}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardHome;
