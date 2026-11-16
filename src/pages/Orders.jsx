import React, { useState, useEffect } from 'react';
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
import { 
  FiSearch, 
  FiTruck, 
  FiChevronLeft, 
  FiChevronRight, 
  FiEye, 
  FiRefreshCw, 
  FiPlus, 
  FiTrash2,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { adminPanelApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Orders() {
  const { t, isEnglish } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminPanelApi.getOrders({
        status: statusFilter,
        search: searchTerm,
      });
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error((isEnglish ? 'Failed to load orders: ' : 'ऑर्डर्स लोड करने में त्रुटि: ') + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;
  const currentOrders = orders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleViewOrder = (order) => {
    Swal.fire({
      title: `${isEnglish ? 'Order #' : 'आर्डर #'}${order.orderId}`,
      html: `
        <div style="text-align: left; font-size: 13px; line-height: 1.8;">
          <p><strong>${t('lblCustomer')}</strong> ${order.customer} (+91 ${order.customerPhone})</p>
          <p><strong>${t('lblVendor')}</strong> ${order.vendor}</p>
          <p><strong>${t('lblItems')}</strong> ${order.items}</p>
          <p><strong>${t('lblSiteAddress')}</strong> ${order.siteAddress || 'N/A'}</p>
          <p><strong>${t('lblDriver')}</strong> ${order.driver || t('notAssignedYet')}</p>
          <p><strong>${t('lblDeliveryOtp')}</strong> <span style="font-family: monospace; font-weight: bold; color: #E65100;">${order.deliveryOtp || '4826'}</span></p>
          <hr style="margin: 10px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p><strong>${t('lblTotalOrderAmount')}</strong> ₹${order.totalAmount?.toLocaleString()}</p>
          <p><strong>${t('lblAdminCommission')}</strong> ₹${order.adminCommission || 0}</p>
          <p><strong>${t('lblPaymentMode')}</strong> ${order.paymentMode}</p>
          <p><strong>${t('lblOrderStatus')}</strong> ${order.status}</p>
        </div>
      `,
      showCancelButton: true,
      cancelButtonText: t('close'),
      confirmButtonText: t('updateOrderStatusTitle'),
      confirmButtonColor: '#E65100',
      cancelButtonColor: '#64748b',
    }).then((result) => {
      if (result.isConfirmed) {
        handleUpdateStatus(order);
      }
    });
  };

  const handleUpdateStatus = (order) => {
    Swal.fire({
      title: `${t('updateOrderStatusTitle')} (#${order.orderId})`,
      input: 'select',
      inputOptions: {
        'Pending': isEnglish ? 'Pending' : 'Pending (पेंडिंग)',
        'Confirmed': isEnglish ? 'Confirmed' : 'Confirmed (स्वीकृत)',
        'Dispatched': isEnglish ? 'Dispatched' : 'Dispatched (भट्ठे/स्टोर से रवाना)',
        'Out for Delivery': isEnglish ? 'Out for Delivery' : 'Out for Delivery (रास्ते में)',
        'Delivered': isEnglish ? 'Delivered' : 'Delivered (साइट पर डिलीवर)',
        'Cancelled': isEnglish ? 'Cancelled' : 'Cancelled (रद्द)',
      },
      inputValue: order.status,
      showCancelButton: true,
      confirmButtonColor: '#E65100',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('update'),
      cancelButtonText: t('cancel'),
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await adminPanelApi.updateOrderStatus(order._id, { status: result.value });
          toast.success(t('orderStatusUpdatedSuccess'));
          fetchOrders();
        } catch (err) {
          toast.error(err.message || 'Status update failed');
        }
      }
    });
  };

  const handleDeleteOrder = (order) => {
    Swal.fire({
      title: t('deleteOrderTitle'),
      text: `${order.orderId} - ${order.customer} (₹${order.totalAmount})`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('delete'),
      cancelButtonText: t('cancel'),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminPanelApi.deleteOrder(order._id);
          toast.success(t('orderDeletedSuccess'));
          fetchOrders();
        } catch (err) {
          toast.error(err.message || 'Delete failed');
        }
      }
    });
  };

  const handleCreateOrderModal = () => {
    Swal.fire({
      title: t('createOrderBtn'),
      html: `
        <div style="text-align: left; font-size: 12px; display: flex; flex-direction: column; gap: 8px;">
          <label><b>${isEnglish ? 'Customer Name:' : 'ग्राहक का नाम:'}</b></label>
          <input id="swal-order-cust" class="swal2-input" placeholder="उदा. अमित सिंह (ठेकेदार)" style="margin: 0; width: 100%;">

          <label><b>${isEnglish ? 'Customer Phone:' : 'ग्राहक मोबाइल:'}</b></label>
          <input id="swal-order-phone" class="swal2-input" placeholder="9876543210" style="margin: 0; width: 100%;">

          <label><b>${isEnglish ? 'Vendor / Bhattha Name:' : 'संबद्ध भट्ठा / दुकान:'}</b></label>
          <input id="swal-order-vendor" class="swal2-input" placeholder="उदा. माँ भवानी ईंट उद्योग" style="margin: 0; width: 100%;">

          <label><b>${isEnglish ? 'Materials & Qty:' : 'सामग्री एवं मात्रा:'}</b></label>
          <input id="swal-order-items" class="swal2-input" placeholder="उदा. 4000 अव्वल ईंटें + 1 ट्रॉली मौरंग" style="margin: 0; width: 100%;">

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <label><b>${isEnglish ? 'Total Amount (₹):' : 'कुल रकम (₹):'}</b></label>
              <input id="swal-order-amount" type="number" class="swal2-input" placeholder="28000" style="margin: 0; width: 100%;">
            </div>
            <div>
              <label><b>${isEnglish ? 'Payment Mode:' : 'भुगतान विधि:'}</b></label>
              <select id="swal-order-pay" class="swal2-input" style="margin: 0; width: 100%;">
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="Online Paid">Online Paid (UPI/Card)</option>
              </select>
            </div>
          </div>

          <label><b>${isEnglish ? 'Site Delivery Address:' : 'साइट डिलीवरी पता:'}</b></label>
          <input id="swal-order-site" class="swal2-input" placeholder="उदा. प्लॉट नं 12, सुल्तानपुर रोड, लखनऊ" style="margin: 0; width: 100%;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#E65100',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('save'),
      cancelButtonText: t('cancel'),
      preConfirm: () => {
        const customer = document.getElementById('swal-order-cust').value;
        const customerPhone = document.getElementById('swal-order-phone').value;
        const vendor = document.getElementById('swal-order-vendor').value;
        const items = document.getElementById('swal-order-items').value;
        const totalAmount = document.getElementById('swal-order-amount').value;
        const paymentMode = document.getElementById('swal-order-pay').value;
        const siteAddress = document.getElementById('swal-order-site').value;

        if (!customer || !customerPhone || !items || !totalAmount) {
          Swal.showValidationMessage(isEnglish ? 'Please fill required fields!' : 'कृपया आवश्यक विवरण भरें!');
          return false;
        }

        return {
          customer,
          customerPhone,
          vendor: vendor || 'Direct Contractor Store',
          items,
          totalAmount: Number(totalAmount),
          paymentMode,
          siteAddress,
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminPanelApi.createOrder(result.value);
          toast.success(isEnglish ? 'Order created successfully!' : 'आर्डर सफलतापूर्वक बनाया गया!');
          fetchOrders();
        } catch (err) {
          toast.error(err.message || 'Failed to create order');
        }
      }
    });
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('ordersTitle')}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('ordersSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handleCreateOrderModal}
            className="px-4 py-2 bg-primary hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <FiPlus size={16} />
            <span>{t('createOrderBtn')}</span>
          </button>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2"
          >
            <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{t('refresh')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchOrderPlaceholder')}
              className="w-full bg-slate-50 pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <button type="submit" className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-xl">
            {t('search')}
          </button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Pending', 'Confirmed', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'All' ? t('allOrders') : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <Stack spacing={4}>
              <Skeleton height="40px" />
              <Skeleton height="40px" />
              <Skeleton height="40px" />
            </Stack>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FiTruck size={44} className="mx-auto mb-3 opacity-40 text-primary" />
            <p className="text-sm font-bold text-slate-700">{t('noOrdersFound')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('noOrdersFoundSub')}</p>
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
                  <Th color="slate.500" fontSize="11px">{t('status')}</Th>
                  <Th color="slate.500" fontSize="11px" textAlign="right">{t('colViewDetails')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentOrders.map((order) => (
                  <Tr key={order._id} _hover={{ bg: 'slate.50' }}>
                    <Td fontWeight="bold" fontSize="12px" py={3}>
                      {order.orderId}
                    </Td>
                    <Td>
                      <p className="font-semibold text-xs text-slate-800">{order.customer}</p>
                      <p className="text-[11px] text-slate-400">+91 {order.customerPhone}</p>
                    </Td>
                    <Td fontSize="12px" color="slate.600">
                      {order.vendor}
                    </Td>
                    <Td fontSize="12px" maxW="200px" isTruncated>
                      {order.items}
                    </Td>
                    <Td fontWeight="bold" fontSize="12px">
                      ₹{order.totalAmount?.toLocaleString()}
                    </Td>
                    <Td fontWeight="bold" fontSize="12px" color="green.600">
                      ₹{order.adminCommission || 0}
                    </Td>
                    <Td fontSize="11px">
                      <span className={`px-2 py-0.5 rounded font-bold ${order.paymentMode === 'COD' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {order.paymentMode}
                      </span>
                    </Td>
                    <Td>
                      <Badge 
                        cursor="pointer"
                        onClick={() => handleUpdateStatus(order)}
                        title={isEnglish ? "Click to change status" : "स्थिति बदलने के लिए क्लिक करें"}
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
                    <Td textAlign="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewOrder(order)}
                          title={t('viewFullDetails')}
                          className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order)}
                          title="Delete Order"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {orders.length > itemsPerPage && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{isEnglish ? `Showing ${(page - 1) * itemsPerPage + 1} - ${Math.min(page * itemsPerPage, orders.length)} of ${orders.length} orders` : `कुल ${orders.length} में से ${(page - 1) * itemsPerPage + 1} - ${Math.min(page * itemsPerPage, orders.length)} ऑर्डर्स`}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="font-bold text-slate-700">{t('page')} {page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
