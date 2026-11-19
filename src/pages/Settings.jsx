import React, { useState, useEffect } from 'react';
import { 
  FiSettings, 
  FiSave, 
  FiPhone, 
  FiMail, 
  FiTruck, 
  FiPercent, 
  FiShield, 
  FiAlertTriangle,
  FiRefreshCw,
  FiCheckCircle,
  FiGlobe,
  FiLock,
  FiEye,
  FiEyeOff,
  FiBell,
  FiSend
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminPanelApi, adminAuthApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Settings() {
  const { t, isEnglish } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Change Password state
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Test Push Notification State
  const [testNotifLoading, setTestNotifLoading] = useState(false);
  const [testNotif, setTestNotif] = useState({
    appType: 'vendor', // 'customer' | 'vendor' | 'delivery'
    phone: '',
    title: '🔔 Live App Notification Test',
    body: 'Ye push notification test Admin Panel dwara bheja gaya hai!',
  });

  const handleSendTestNotification = async (e) => {
    e.preventDefault();
    if (!testNotif.phone.trim()) {
      toast.error(isEnglish ? 'Please enter registered mobile number!' : 'कृपया रजिस्टर्ड मोबाइल नंबर दर्ज करें!');
      return;
    }
    setTestNotifLoading(true);
    try {
      const res = await adminPanelApi.sendTestFcm({
        appType: testNotif.appType,
        phone: testNotif.phone.trim(),
        title: testNotif.title.trim(),
        body: testNotif.body.trim(),
      });
      if (res.success) {
        toast.success(
          isEnglish 
            ? `Push notification sent to ${testNotif.appType.toUpperCase()} (${testNotif.phone})!` 
            : `${testNotif.appType.toUpperCase()} (${testNotif.phone}) पर नोटिफिकेशन सफलतापूर्वक भेजा गया!`
        );
      } else {
        toast.error(res.message || 'Notification sending failed');
      }
    } catch (err) {
      toast.error(err.message || 'Error sending test push notification');
    } finally {
      setTestNotifLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    platformName: 'Contract Bazar',
    supportPhone: '+91 9876543210',
    supportEmail: 'support@contractbazar.com',
    emergencyHelpline: '1800-123-4567',
    defaultFreeDeliveryKm: 5,
    defaultPerKmCharge: 15,
    maxDeliveryRadiusKm: 50,
    defaultCommissionType: 'Percentage',
    defaultCommissionRate: 5,
    minPayoutAmount: 1000,
    payoutCycleDays: 7,
    allowNewVendorRegistrations: true,
    autoVerifyDriverLicense: false,
    maintenanceMode: false,
    maintenanceNotice: 'Contract Bazar platform is currently under maintenance. We will be back shortly.',
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminPanelApi.getSettings();
      if (res.success && res.settings) {
        setFormData(res.settings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      toast.error((isEnglish ? 'Failed to load settings: ' : 'सेटिंग्स लोड करने में त्रुटि: ') + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminPanelApi.updateSettings(formData);
      if (res.success) {
        toast.success(t('settingsSavedSuccess'));
        if (res.settings) setFormData(res.settings);
      }
    } catch (err) {
      console.error('Save settings error:', err);
      toast.error((isEnglish ? 'Failed to save settings: ' : 'सेटिंग्स सेव करने में त्रुटि: ') + (err.message || 'Server error'));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error(isEnglish ? 'Please fill all password fields!' : 'कृपया सभी पासवर्ड फ़ील्ड भरें!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t('passwordLengthError'));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('passwordMismatchError'));
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await adminAuthApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      if (res.success) {
        toast.success(t('passwordChangedSuccess'));
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      console.error('Change password error:', err);
      toast.error((isEnglish ? 'Failed to change password: ' : 'पासवर्ड बदलने में त्रुटि: ') + (err.message || 'Server error'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-900/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[11px] font-bold bg-primary/20 text-orange-400 rounded-full border border-primary/30 uppercase tracking-wider">
              {t('navSettings')}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {t('liveSystem')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">{t('settingsTitle')}</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {t('settingsSubtitle')}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-5 py-3 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2 self-start transition-all disabled:opacity-50"
        >
          <FiSave size={16} />
          <span>{saving ? t('savingSettings') : t('saveSettingsBtn')}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'general', label: t('tabGeneral'), icon: FiGlobe },
          { id: 'delivery', label: t('tabDelivery'), icon: FiTruck },
          { id: 'commission', label: t('tabCommissionPolicy'), icon: FiPercent },
          { id: 'ops', label: t('tabSecurityOps'), icon: FiShield },
          { id: 'password', label: t('tabSecurityPassword'), icon: FiLock },
          { id: 'notifications', label: isEnglish ? 'Push Notifications' : 'पुश नोटिफिकेशन टेस्ट', icon: FiBell },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: General & Support */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblPlatformName')}
                </label>
                <input
                  type="text"
                  value={formData.platformName}
                  onChange={(e) => handleChange('platformName', e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblSupportPhone')}
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={formData.supportPhone}
                    onChange={(e) => handleChange('supportPhone', e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblSupportEmail')}
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblHelpline')}
                </label>
                <input
                  type="text"
                  value={formData.emergencyHelpline}
                  onChange={(e) => handleChange('emergencyHelpline', e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Delivery & Logistics */}
          {activeTab === 'delivery' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblDefaultFreeKm')}
                </label>
                <input
                  type="number"
                  value={formData.defaultFreeDeliveryKm}
                  onChange={(e) => handleChange('defaultFreeDeliveryKm', Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblDefaultPerKm')}
                </label>
                <input
                  type="number"
                  value={formData.defaultPerKmCharge}
                  onChange={(e) => handleChange('defaultPerKmCharge', Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblMaxRadius')}
                </label>
                <input
                  type="number"
                  value={formData.maxDeliveryRadiusKm}
                  onChange={(e) => handleChange('maxDeliveryRadiusKm', Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Commission & Payout Policy */}
          {activeTab === 'commission' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblDefaultCommType')}
                </label>
                <select
                  value={formData.defaultCommissionType}
                  onChange={(e) => handleChange('defaultCommissionType', e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                >
                  <option value="Percentage">{t('percentage')}</option>
                  <option value="Fixed">{t('fixedPerUnit')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblDefaultCommRate')} ({formData.defaultCommissionType === 'Percentage' ? '%' : '₹'})
                </label>
                <input
                  type="number"
                  value={formData.defaultCommissionRate}
                  onChange={(e) => handleChange('defaultCommissionRate', Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblMinPayout')}
                </label>
                <input
                  type="number"
                  value={formData.minPayoutAmount}
                  onChange={(e) => handleChange('minPayoutAmount', Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblPayoutCycle')}
                </label>
                <input
                  type="number"
                  value={formData.payoutCycleDays}
                  onChange={(e) => handleChange('payoutCycleDays', Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Operations & Maintenance */}
          {activeTab === 'ops' && (
            <div className="space-y-6">
              {/* Toggle 1: Allow Vendor Reg */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t('toggleAllowVendorReg')}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{t('toggleAllowVendorRegSub')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.allowNewVendorRegistrations}
                  onChange={(e) => handleChange('allowNewVendorRegistrations', e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
              </div>

              {/* Toggle 2: Auto Verify Driver */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t('toggleAutoVerifyDriver')}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{t('toggleAutoVerifyDriverSub')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoVerifyDriverLicense}
                  onChange={(e) => handleChange('autoVerifyDriverLicense', e.target.checked)}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
              </div>

              {/* Toggle 3: Maintenance Mode */}
              <div className="flex items-center justify-between p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                <div>
                  <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                    <FiAlertTriangle className="text-amber-600" />
                    <span>{t('toggleMaintenance')}</span>
                  </h4>
                  <p className="text-xs text-amber-700/80 mt-0.5">{t('toggleMaintenanceSub')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
                />
              </div>

              {formData.maintenanceMode && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    {t('lblMaintenanceNotice')}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.maintenanceNotice}
                    onChange={(e) => handleChange('maintenanceNotice', e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-4 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                  />
                </div>
              )}
            </div>
          )}

          {/* Form Actions Footer for Platform Settings */}
          {activeTab !== 'password' && (
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={fetchSettings}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <FiSave size={15} />
                <span>{saving ? t('savingSettings') : t('saveSettingsBtn')}</span>
              </button>
            </div>
          )}
        </form>

        {/* TAB 5: Security & Change Password */}
        {activeTab === 'password' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FiLock className="text-primary" />
                <span>{t('changePasswordTitle')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('changePasswordSubtitle')}
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5 max-w-xl">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblCurrentPassword')}
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full bg-slate-50 text-slate-900 text-sm pl-11 pr-11 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblNewPassword')}
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full bg-slate-50 text-slate-900 text-sm pl-11 pr-11 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isEnglish ? 'Minimum 6 characters, recommend strong combination.' : 'कम से कम 6 अक्षर, मजबूत पासवर्ड चुनें।'}
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('lblConfirmPassword')}
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-slate-50 text-slate-900 text-sm pl-11 pr-11 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <FiCheckCircle size={15} />
                  <span>{passwordLoading ? t('changingPassword') : t('btnChangePassword')}</span>
                </button>
              </div>
            </form>
          </div>
        )}
        {/* TAB 6: PUSH NOTIFICATIONS TESTING FOR ALL 3 APPS */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-200 text-orange-900">
              <FiBell size={24} className="text-primary flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">
                  {isEnglish ? 'Live Push Notification Testing Hub' : 'लाइव पुश नोटिफिकेशन टेस्टिंग हब'}
                </h4>
                <p className="text-xs text-orange-700 mt-0.5">
                  {isEnglish
                    ? 'Send instant live push notifications to Customer App, Vendor App, or Delivery App to verify device delivery.'
                    : 'Customer, Vendor या Delivery App पर सीधे लाइव नोटिफिकेशन भेजकर चेक करें कि मोबाइल पर नोटिफिकेशन पहुंच रहा है या नहीं।'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendTestNotification} className="space-y-5">
              {/* Target App Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {isEnglish ? 'Target App' : 'टारगेट मोबाइल ऐप'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'customer', label: isEnglish ? 'Customer App' : 'कस्टमर ऐप', color: 'border-blue-500 text-blue-700 bg-blue-50' },
                    { id: 'vendor', label: isEnglish ? 'Vendor App' : 'वेंडर ऐप', color: 'border-orange-500 text-orange-700 bg-orange-50' },
                    { id: 'delivery', label: isEnglish ? 'Delivery App' : 'डिलीवरी ऐप', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
                  ].map(app => {
                    const isSelected = testNotif.appType === app.id;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setTestNotif(prev => ({ ...prev, appType: app.id }))}
                        className={`py-3 px-4 rounded-xl text-xs font-bold border-2 transition-all text-center ${
                          isSelected ? app.color : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {app.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Registered Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {isEnglish ? 'Registered 10-Digit Mobile Number *' : 'रजिस्टर्ड मोबाइल नंबर *'}
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. 7549910055"
                    value={testNotif.phone}
                    onChange={(e) => setTestNotif(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-50 text-slate-900 text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isEnglish
                    ? 'Enter the mobile number that logged into the chosen app.'
                    : 'जिस नंबर से ऐप में लॉगिन किया गया है, वही 10 अंकों का नंबर डालें।'}
                </p>
              </div>

              {/* Notification Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {isEnglish ? 'Notification Title' : 'नोटिफिकेशन शीर्षक (Title)'}
                </label>
                <input
                  type="text"
                  value={testNotif.title}
                  onChange={(e) => setTestNotif(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                  required
                />
              </div>

              {/* Notification Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {isEnglish ? 'Notification Message Body' : 'संदेश विवरण (Message Body)'}
                </label>
                <textarea
                  rows={3}
                  value={testNotif.body}
                  onChange={(e) => setTestNotif(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full bg-slate-50 text-slate-900 text-sm p-4 rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all font-semibold"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={testNotifLoading}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <FiSend size={15} />
                  <span>{testNotifLoading ? (isEnglish ? 'Sending Push...' : 'भेजा जा रहा है...') : (isEnglish ? 'Send Live Notification Now' : 'लाइव पुश नोटिफिकेशन भेजें')}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

