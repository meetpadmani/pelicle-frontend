import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, FolderTree, Tag, Star, Menu, X, LogOut, Settings, Plug, ImageIcon, Megaphone, Bell, Globe, Search, Database, Truck, MessageSquare, FileText } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();

  const menuGroups = [
    {
      title: 'OVERVIEW',
      items: [{ path: '/admin', label: 'Dashboard', icon: LayoutDashboard }]
    },
    {
      title: 'INVENTORY',
      items: [
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/categories', label: 'Categories', icon: FolderTree }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/admin/reviews', label: 'Reviews', icon: Star },
        { path: '/admin/users', label: 'Users', icon: Users },
      ]
    },
    {
      title: 'LOGISTICS',
      items: [
        { path: '/admin/shiprocket', label: 'Shiprocket Panel', icon: Truck },
        { path: '/admin/shipping-rules', label: 'Shipping Rules', icon: Settings },
      ]
    },
    {
      title: 'MARKETING',
      items: [
        { path: '/admin/coupons', label: 'Coupons', icon: Tag },
        { path: '/admin/announcement', label: 'Announcement Bar', icon: Megaphone },
        { path: '/admin/popup-settings', label: 'Popup Settings', icon: MessageSquare },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { path: '/admin/pages', label: 'Pages', icon: FileText },
        { path: '/admin/home-builder', label: 'Homepage Builder', icon: LayoutDashboard },
        { path: '/admin/layout', label: 'Layout Editor', icon: Settings },
        { path: '/admin/site-settings', label: 'Site & Logo Settings', icon: Globe },
        { path: '/admin/seo-settings', label: 'SEO Settings', icon: Search },
        { path: '/admin/notification-rules', label: 'Notification Rules', icon: Bell },
        { path: '/admin/integrations', label: 'Integrations', icon: Plug },
        { path: '/admin/data-backup', label: 'Data Backup', icon: Database },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-body">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#0B5345] z-50 transform transition-transform duration-300 flex flex-col shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center px-6 flex-shrink-0 gap-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center font-heading font-extrabold text-[#0B5345] text-xl shadow-sm">P</div>
          <div>
            <h1 className="font-heading font-bold text-white text-lg leading-tight">Pelicle</h1>
            <p className="text-white/60 text-xs font-medium">Workspace</p>
          </div>
          <button className="lg:hidden text-white/50 ml-auto" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 px-4 space-y-6 scrollbar-hide">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <p className="px-2 text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 font-heading">{group.title}</p>
              <nav className="space-y-1">
                {group.items.map(({ path, label, icon: Icon }) => {
                  const active = location.pathname === path;
                  return (
                    <Link key={path} to={path} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${active
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}>
                      <Icon size={18} className={active ? 'text-white' : 'text-white/70'} />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/10 border border-white/5 hover:bg-white/20 transition-colors cursor-pointer" onClick={() => dispatch(logoutUser())}>
            <div className="w-8 h-8 rounded-full bg-[#0E8A74] flex items-center justify-center text-white text-xs font-bold">MB</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white leading-tight">My Business</p>
              <p className="text-[10px] text-white/60">v1.0 • Online</p>
            </div>
            <LogOut size={16} className="text-white/50" />
          </div>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (Hidden on Desktop since Drafto has no top header) */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <button className="p-2 -ml-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-[#0B5345]" />
          </button>
          <div className="font-heading font-bold text-[#0B5345]">Pelicle Workspace</div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
