import React, { useState, useEffect, useCallback } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiShoppingBag, 
  FiUsers, 
  FiTruck, 
  FiRefreshCw, 
  FiDownload,
  FiPieChart,
  FiFileText,
  FiCheckCircle,
  FiArrowUpRight
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
import toast from 'react-hot-toast';
import { adminPanelApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Commissions() {
  const { t, isEnglish } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7days');
  const [data, setData] = useState({
    totals: {
      totalGrossSales: 0,
      totalAdminCommission: 0,
      totalDeliveryCharges: 0,
      totalVendorPayout: 0,
      totalOrders: 0,
    },
    commissionByCategory: [],
    commissionByVendor: [],
    recentTransactions: [],
  });

  const fetchRevenueData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const res = await adminPanelApi.getRevenueCommission({ timeRange });
      if (res.success) {
        setData({
          totals: res.totals || {},
          commissionByCategory: res.commissionByCategory || [],
          commissionByVendor: res.commissionByVendor || [],
          recentTransactions: res.recentTransactions || [],
        });
      }
    } catch (err) {
      console.error('Failed to load revenue data:', err);
      toast.error((isEnglish ? 'Failed to load revenue data: ' : 'रेवेन्यू डेटा लोड करने में त्रुटि: ') + (err.message || 'Server error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange, isEnglish]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  // Highcharts Pie / Donut Chart for Commission by Material Category
  const pieChartSeries = data.commissionByCategory.map(item => ({
    name: item._id,
    y: item.totalCommission,
  }));

  const categoryChartOptions = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 290,
    },
    title: { text: null },
    credits: { enabled: false },
    tooltip: {
      pointFormat: '<b>₹{point.y:,.0f}</b> ({point.percentage:.1f}%)',
      backgroundColor: '#0F172A',
      style: { color: '#FFF' },
      borderRadius: 10,
    },
    plotOptions: {
      pie: {
        innerSize: '58%',
        depth: 20,
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%',
          style: { fontSize: '10px', color: '#475569' }
        },
        colors: ['#E65100', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#64748B']
      }
    },
    series: [{
      name: isEnglish ? 'Commission' : 'कमीशन',
      colorByPoint: true,
      data: pieChartSeries
    }]
  };

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header with Time-Range Filters & Fast Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-900/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 uppercase tracking-wider">
              {t('navCommissions')}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-orange-400 font-semibold bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {t('liveSystem')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">{t('revenueTitle')}</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {t('revenueSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Time range switcher */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 shadow-inner">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === '7days' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('timeRange7d')}
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === '30days' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('timeRange30d')}
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === 'all' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('timeRangeAll')}
            </button>
          </div>

          <button
            onClick={() => fetchRevenueData(true)}
            disabled={refreshing}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <FiRefreshCw size={14} className={refreshing ? "animate-spin text-emerald-400" : ""} />
            <span>{refreshing ? t('refreshing') : t('refresh')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Revenue Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Gross Sales */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('cardGrossSales')}</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center">
              <FiShoppingBag size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            ₹{(data.totals.totalGrossSales || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-2">
            <FiCheckCircle size={13} className="text-emerald-500" />
            <span>{data.totals.totalOrders || 0} {t('totalOrders')}</span>
          </div>
        </div>

        {/* Card 2: Net Platform Commission */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('cardNetCommission')}</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiDollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-3">
            ₹{(data.totals.totalAdminCommission || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-2">
            <FiTrendingUp size={14} />
            <span>{data.totals.totalGrossSales > 0 ? ((data.totals.totalAdminCommission / data.totals.totalGrossSales) * 100).toFixed(1) : 0}% {t('platformRevenueShare')}</span>
          </div>
        </div>

        {/* Card 3: Vendor Payout */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('cardVendorPayout')}</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiUsers size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            ₹{(data.totals.totalVendorPayout || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mt-2">
            <FiArrowUpRight size={14} />
            <span>{isEnglish ? 'Disbursed to Bhatthe & Stores' : 'भट्ठों व स्टोर्स को देय'}</span>
          </div>
        </div>

        {/* Card 4: Delivery Fleet Charges */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('cardDeliveryCharges')}</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiTruck size={20} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            ₹{(data.totals.totalDeliveryCharges || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 mt-2">
            <span>{isEnglish ? 'Tractor & Truck Driver Fleet' : 'ट्रैक्टर-ट्रॉली व ट्रक नेटवर्क'}</span>
          </div>
        </div>
      </div>

      {/* Analytics Row: Category Distribution & Top Earning Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Margin Donut */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900">{t('chartCategoryShare')}</h2>
              <FiPieChart className="text-slate-400" size={18} />
            </div>
            <p className="text-xs text-slate-500 mb-4">{t('chartCategorySub')}</p>
            {loading ? (
              <Stack spacing={3} py={8}>
                <Skeleton height="40px" />
                <Skeleton height="120px" rounded="full" />
                <Skeleton height="40px" />
              </Stack>
            ) : pieChartSeries.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FiPieChart size={38} className="mx-auto mb-2 opacity-40 text-primary" />
                <p className="text-xs font-bold text-slate-700">
                  {isEnglish ? 'No Category Earnings Yet' : 'कोई कैटेगरी कमाई उपलब्ध नहीं'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isEnglish ? 'Earnings will appear once orders with commissions are placed' : 'ऑर्डर आने पर कैटेगरी अनुसार कमीशन चार्ट यहाँ दिखेगा'}
                </p>
              </div>
            ) : (
              <HighchartsReact highcharts={Highcharts} options={categoryChartOptions} />
            )}
          </div>
        </div>

        {/* Top Commission Generating Vendors */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">{t('topVendorsTableTitle')}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{t('topVendorsSub')}</p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-full">
                {data.commissionByVendor.length} {t('allVendors')}
              </span>
            </div>

            {loading ? (
              <Stack spacing={3} mt={4}>
                <Skeleton height="35px" />
                <Skeleton height="35px" />
                <Skeleton height="35px" />
              </Stack>
            ) : data.commissionByVendor.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FiUsers size={38} className="mx-auto mb-2 opacity-40 text-primary" />
                <p className="text-xs font-bold text-slate-700">{t('noVendorsFound')}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{t('noVendorsFoundSub')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <Table variant="simple" size="sm">
                  <Thead bg="slate.50">
                    <Tr>
                      <Th color="slate.500" fontSize="11px">{t('colRank')}</Th>
                      <Th color="slate.500" fontSize="11px">{t('colVendorName')}</Th>
                      <Th color="slate.500" fontSize="11px">{t('colTotalSales')}</Th>
                      <Th color="slate.500" fontSize="11px">{t('colCommissionEarned')}</Th>
                      <Th color="slate.500" fontSize="11px">{t('colOrderCount')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.commissionByVendor.map((v, idx) => (
                      <Tr key={v._id || idx} _hover={{ bg: 'slate.50' }}>
                        <Td fontSize="11px" fontWeight="bold" color="slate.400">#{idx + 1}</Td>
                        <Td fontSize="12px" fontWeight="bold" color="slate.800">{v._id || 'Unknown Store'}</Td>
                        <Td fontSize="12px" color="slate.600">₹{(v.vendorSales || 0).toLocaleString()}</Td>
                        <Td fontSize="12px" fontWeight="bold" color="emerald.600">₹{(v.platformCommission || 0).toLocaleString()}</Td>
                        <Td fontSize="11px">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-bold">
                            {v.ordersCount}
                          </span>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Financial Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('financialLedgerTitle')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('financialLedgerSub')}</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {isEnglish ? 'Audited Ledger' : 'ऑडिटेड लेज़र'}
          </span>
        </div>

        {loading ? (
          <div className="p-6">
            <Stack spacing={4}>
              <Skeleton height="35px" />
              <Skeleton height="35px" />
              <Skeleton height="35px" />
            </Stack>
          </div>
        ) : data.recentTransactions.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <FiFileText size={44} className="mx-auto mb-2 opacity-40 text-emerald-500" />
            <p className="text-sm font-bold text-slate-700">{t('noOrdersYet')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('noOrdersYetSub')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table variant="simple" size="sm">
              <Thead bg="slate.50">
                <Tr>
                  <Th color="slate.500" fontSize="11px">{t('colOrderId')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colVendor')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colItems')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colLedgerGross')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colLedgerDelivery')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colLedgerNetEarned')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colLedgerVendorShare')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colPayment')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('status')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.recentTransactions.map((tx) => (
                  <Tr key={tx._id} _hover={{ bg: 'slate.50' }}>
                    <Td fontWeight="bold" fontSize="12px">{tx.orderId}</Td>
                    <Td fontSize="12px" color="slate.700" fontWeight="semibold">{tx.vendor}</Td>
                    <Td fontSize="12px" maxW="200px" isTruncated color="slate.600">{tx.items}</Td>
                    <Td fontWeight="bold" fontSize="12px">₹{tx.totalAmount?.toLocaleString()}</Td>
                    <Td fontSize="12px" color="slate.500">₹{tx.deliveryCharge || 0}</Td>
                    <Td fontWeight="bold" fontSize="12px" color="emerald.600">
                      ₹{tx.adminCommission || 0}
                    </Td>
                    <Td fontWeight="bold" fontSize="12px" color="blue.600">
                      ₹{((tx.totalAmount || 0) - (tx.adminCommission || 0)).toLocaleString()}
                    </Td>
                    <Td fontSize="11px">
                      <span className={`px-2 py-0.5 rounded font-bold ${tx.paymentMode === 'COD' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {tx.paymentMode}
                      </span>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          tx.status === 'Delivered' ? 'green' :
                          tx.status === 'Cancelled' ? 'red' :
                          tx.status === 'Out for Delivery' ? 'blue' : 'orange'
                        }
                        borderRadius="6px"
                        fontSize="10px"
                      >
                        {tx.status}
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

