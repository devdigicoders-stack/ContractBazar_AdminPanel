import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiLayers, 
  FiUsers, 
  FiShoppingBag, 
  FiTruck, 
  FiDollarSign, 
  FiSettings, 
  FiLogOut,
  FiBell,
  FiSearch,
  FiMenu,
  FiX,
  FiGlobe
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const { language, toggleLanguage, setLanguage, t, isEnglish } = useLanguage();

  const handleLogout = () => {
    Swal.fire({
      title: t('logoutConfirmTitle'),
      text: t('logoutConfirmText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E65100',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('logoutConfirmBtn'),
      cancelButtonText: t('cancel')
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        toast.success(t('logoutSuccess'));
        navigate('/login');
      }
    });
  };

  const navLinks = [
    { to: '/', label: t('navDashboard'), icon: FiHome },
    { to: '/categories', label: t('navCategories'), icon: FiLayers },
    { to: '/vendors', label: t('navVendors'), icon: FiUsers },
    { to: '/orders', label: t('navOrders'), icon: FiShoppingBag },
    { to: '/delivery-agents', label: t('navDrivers'), icon: FiTruck },
    { to: '/commissions', label: t('navCommissions'), icon: FiDollarSign },
    { to: '/settings', label: t('navSettings'), icon: FiSettings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-slate-900 text-slate-100 flex flex-col justify-between
        transition-transform duration-300 ease-in-out shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-orange-400 text-white font-extrabold flex items-center justify-center text-lg shadow-lg shadow-orange-500/20">
                CB
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">Contract Bazar</h1>
                <p className="text-[10px] text-slate-400 font-medium">{t('superAdminPortal')}</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            <p className="px-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">{t('mainMenu')}</p>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 font-semibold' 
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800/80 m-3 rounded-2xl bg-slate-900/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-sm border-2 border-primary">
                {admin?.name ? admin.name.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white leading-tight truncate">
                  {admin?.name || 'Admin'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {admin?.email || 'admin@contractbazar.com'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title={t('logout')}
              className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <FiMenu size={22} />
            </button>
            <div className="relative hidden sm:block w-72">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input 
                type="text"
                placeholder={isEnglish ? "Search order, vendor, category..." : "सर्च आर्डर, वेंडर, कैटेगरी..."}
                className="w-full bg-slate-100 pl-10 pr-4 py-2 text-xs rounded-xl border border-transparent focus:bg-white focus:border-primary focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Switcher Pill Toggle in Header */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isEnglish
                    ? 'bg-white text-primary shadow-sm font-extrabold border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                <span>English</span>
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  !isEnglish
                    ? 'bg-primary text-white shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Switch to Hindi (हिंदी)"
              >
                <span>हिंदी</span>
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Notification Bell */}
            <button 
              onClick={() => toast(isEnglish ? 'No new system alerts' : 'कोई नया अलर्ट नहीं है', { icon: '🔔' })}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <FiBell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white"></span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Live System Indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-700">{t('liveSystem')}</span>
            </div>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
