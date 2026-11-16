import React, { useState, useEffect, useCallback } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { 
  FiShoppingBag, 
  FiUsers, 
  FiDollarSign, 
  FiTrendingUp, 
  FiTruck, 
  FiAlertCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiActivity
} from 'react-icons/fi';
import { 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Badge, 
  Skeleton, 
  Stack 
} from '@chakra-ui/react';
import { adminPanelApi } from '../services/api';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard() {
  const { t, isEnglish } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalOrdersCount: 0,
    pendingOrdersCount: 0,
    deliveredOrdersCount: 0,
    totalVendorsCount: 0,
    pendingVendorsCount: 0,
    approvedVendorsCount: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalDeliveryCharges: 0,
  });
  const [chartData, setChartData] = useState({
    categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    revenueData: [0, 0, 0, 0, 0, 0, 0],
    commissionData: [0, 0, 0, 0, 0, 0, 0],
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentVendors, setRecentVendors] = useState([]);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const res = await adminPanelApi.getDashboardStats();
      if (res.success) {
        setStats(res.stats || {});
        if (res.chart && res.chart.categories) {
          setChartData(res.chart);
        }
        setRecentOrders(res.recentOrders || []);
        setRecentVendors(res.recentVendors || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error((isEnglish ? 'Failed to load dashboard data: ' : 'डैशबोर्ड डेटा लोड करने में त्रुटि: ') + (err.message || 'Server error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isEnglish]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Dynamic Highcharts options supporting both languages
  const weekDaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekDaysHi = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  const localizedCategories = chartData.categories.map((c, i) => {
    return isEnglish ? (weekDaysEn[i] || c) : (weekDaysHi[i] || c);
  });

  const revenueChartOptions = {
    chart: {
      type: 'areaspline',
      backgroundColor: 'transparent',
      height: 330,
    },
    title: { text: null },
    credits: { enabled: false },
    xAxis: {
      categories: localizedCategories,
      labels: { style: { color: '#64748B', fontSize: '11px', fontWeight: 'bold' } },
      gridLineColor: '#F1F5F9',
    },
    yAxis: {
      title: { text: isEnglish ? 'Amount (₹)' : 'रकम (₹)', style: { color: '#64748B', fontSize: '11px' } },
      labels: { style: { color: '#64748B' } },
      gridLineColor: '#F1F5F9',
    },
    tooltip: {
      shared: true,
      valuePrefix: '₹',
      backgroundColor: '#0F172A',
      style: { color: '#FFF' },
      borderRadius: 10,
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.12,
        lineWidth: 3,
        marker: { radius: 4 },
      },
    },
    series: [
      {
        name: t('totalSalesSeries'),
        data: chartData.revenueData,
        color: '#E65100',
      },
      {
        name: t('adminCommissionSeries'),
        data: chartData.commissionData,
        color: '#10B981',
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome with Fast Refresh Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-900/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[11px] font-bold bg-primary/20 text-orange-400 rounded-full border border-primary/30 uppercase tracking-wider">
              {t('liveMonitoring')}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {t('fastAggregateApi')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">{t('dashboardTitle')}</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {t('dashboardSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <FiRefreshCw size={14} className={refreshing ? "animate-spin text-primary" : ""} />
            <span>{refreshing ? t('refreshing') : t('dataRefresh')}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (Real Database Count & Aggregation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total GMV Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('totalGMV')}</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center">
              <FiDollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            ₹{stats.totalRevenue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-2">
            <FiTrendingUp size={14} />
            <span>{t('compiledFromOrders')}</span>
          </div>
        </div>

        {/* Card 2: Net Admin Commission */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('adminCommission')}</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiTrendingUp size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-3">
            ₹{stats.totalCommission.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-2">
            <FiCheckCircle size={13} className="text-emerald-500" />
            <span>{t('platformRevenueShare')}</span>
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('totalOrders')}</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiShoppingBag size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{stats.totalOrdersCount}</p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 mt-2">
            <FiClock size={13} />
            <span>{stats.pendingOrdersCount} {t('activeInDelivery')}</span>
          </div>
        </div>

        {/* Card 4: Registered Vendors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('totalVendors')}</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiUsers size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{stats.totalVendorsCount}</p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 mt-2">
            <FiAlertCircle size={13} />
            <span>{stats.pendingVendorsCount} {t('pendingKYC')}</span>
          </div>
        </div>
      </div>

      {/* Chart & Pending KYC Verifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Trends Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('sevenDayTrends')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('sevenDayTrendsSub')}</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
              {t('dailyLive')}
            </span>
          </div>
          <HighchartsReact highcharts={Highcharts} options={revenueChartOptions} />
        </div>

        {/* Pending KYC Verifications Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">{t('pendingVendorVerifications')}</h2>
              <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-full">
                {stats.pendingVendorsCount} {t('newBadge')}
              </span>
            </div>

            {loading ? (
              <Stack spacing={3}>
                <Skeleton height="50px" borderRadius="12px" />
                <Skeleton height="50px" borderRadius="12px" />
                <Skeleton height="50px" borderRadius="12px" />
              </Stack>
            ) : recentVendors.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <FiUsers size={36} className="mx-auto mb-2 opacity-40 text-primary" />
                <p className="text-xs font-bold text-slate-700">{t('noPendingVendors')}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{t('noPendingVendorsSub')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentVendors.map((vendor) => (
                  <div key={vendor._id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                        {vendor.businessName}
                      </p>
                      <Badge colorScheme="orange" fontSize="10px" borderRadius="6px">
                        {isEnglish ? 'Pending KYC' : 'पेंडिंग KYC'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {vendor.ownerFullName} • {vendor.businessType}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {vendor.district || vendor.state || (isEnglish ? 'Uttar Pradesh' : 'उत्तर प्रदेश')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <a
            href="/vendors"
            className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center transition-all shadow-sm"
          >
            {t('viewAllVendors')}
          </a>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('recentOrdersTitle')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('recentOrdersSub')}</p>
          </div>
          <a href="/orders" className="text-xs font-bold text-primary hover:underline">
            {t('viewAll')}
          </a>
        </div>

        {loading ? (
          <div className="p-6">
            <Stack spacing={4}>
              <Skeleton height="35px" />
              <Skeleton height="35px" />
              <Skeleton height="35px" />
            </Stack>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <FiShoppingBag size={44} className="mx-auto mb-2 opacity-40 text-primary" />
            <p className="text-sm font-bold text-slate-700">{t('noOrdersYet')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('noOrdersYetSub')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table variant="simple" size="sm">
              <Thead bg="slate.50">
                <Tr>
                  <Th color="slate.500" fontSize="11px">{t('colOrderId')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colCustomer')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colVendor')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colItems')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colAmount')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colCommission')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colPayment')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colStatus')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentOrders.map((order) => (
                  <Tr key={order._id} _hover={{ bg: 'slate.50' }}>
                    <Td fontWeight="bold" fontSize="12px">{order.orderId}</Td>
                    <Td fontSize="12px">
                      <p className="font-semibold text-slate-800">{order.customer}</p>
                      <p className="text-[10px] text-slate-400">+91 {order.customerPhone}</p>
                    </Td>
                    <Td fontSize="12px" color="slate.600">{order.vendor}</Td>
                    <Td fontSize="12px" maxW="220px" isTruncated>{order.items}</Td>
                    <Td fontWeight="bold" fontSize="12px">₹{order.totalAmount?.toLocaleString()}</Td>
                    <Td fontWeight="bold" fontSize="12px" color="green.600">₹{order.adminCommission || 0}</Td>
                    <Td fontSize="11px">
                      <span className={`px-2 py-0.5 rounded font-bold ${order.paymentMode === 'COD' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {order.paymentMode}
                      </span>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          order.status === 'Delivered' ? 'green' :
                          order.status === 'Cancelled' ? 'red' :
                          order.status === 'Out for Delivery' ? 'blue' : 'orange'
                        }
                        borderRadius="6px"
                        fontSize="10px"
                      >
                        {order.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
