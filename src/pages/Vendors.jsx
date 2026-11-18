import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FiCheckCircle, 
  FiXCircle, 
  FiMapPin, 
  FiPhone, 
  FiPercent, 
  FiEye, 
  FiRepeat, 
  FiChevronLeft, 
  FiChevronRight, 
  FiAlertTriangle, 
  FiRefreshCw, 
  FiPlus, 
  FiTrash2,
  FiFilter,
  FiLayers,
  FiExternalLink
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { adminPanelApi, getMediaUrl } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Vendors() {
  const navigate = useNavigate();
  const { t, isEnglish } = useLanguage();
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const itemsPerPage = 8;

  // Load Categories dynamically from the database
  const fetchCategories = async () => {
    try {
      const res = await adminPanelApi.getCategories();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error('Failed to load categories for vendor dropdown:', err);
    }
  };

  // Load Vendors dynamically matching category and status
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await adminPanelApi.getVendors({
        status: statusFilter,
        category: categoryFilter,
        search: searchTerm,
      });
      if (res.success) {
        setVendors(res.vendors || []);
      }
    } catch (err) {
      console.error('Failed to load vendors:', err);
      toast.error((isEnglish ? 'Failed to load vendors: ' : 'वेंडर्स लोड करने में त्रुटि: ') + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVendors();
  };

  const totalPages = Math.ceil(vendors.length / itemsPerPage) || 1;
  const currentVendors = vendors.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleApprove = (vendor) => {
    Swal.fire({
      title: `${isEnglish ? 'Approve Vendor: ' : ''}${vendor.businessName}?`,
      html: `
        <div style="text-align: left; font-size: 13px; line-height: 1.8;">
          <p><strong>${isEnglish ? 'Owner:' : 'मालिक:'}</strong> ${vendor.ownerFullName} (+91 ${vendor.mobileNumber})</p>
          <p><strong>${isEnglish ? 'Category:' : 'कैटेगरी:'}</strong> ${vendor.businessType}</p>
          <p><strong>${isEnglish ? 'District:' : 'जिला:'}</strong> ${vendor.district || vendor.state || 'N/A'}</p>
          <hr style="margin: 8px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="color: #16a34a; font-weight: bold;">
            ✓ ${isEnglish ? 'Aadhaar, PAN and Store proofs verified.' : 'आधार कार्ड, पैन कार्ड व दुकान प्रूफ वेरिफाई हो चुके हैं।'}
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('approveVendorBtn'),
      cancelButtonText: t('cancel')
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminPanelApi.updateVendorStatus(vendor._id, { status: 'Approved' });
          toast.success(`${vendor.businessName} ${t('vendorApprovedSuccess')}`);
          fetchVendors();
        } catch (err) {
          toast.error(err.message || 'Update failed');
        }
      }
    });
  };

  const handleReject = (vendor) => {
    Swal.fire({
      title: t('rejectVendorTitle'),
      input: 'textarea',
      inputLabel: t('rejectVendorLabel'),
      inputPlaceholder: t('rejectVendorPlaceholder'),
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('rejectVendorBtn'),
      cancelButtonText: t('cancel'),
      inputValidator: (value) => {
        if (!value) {
          return isEnglish ? 'Please provide a reason for rejection!' : 'कृपया रिजेक्शन का कारण अवश्य लिखें!';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminPanelApi.updateVendorStatus(vendor._id, {
            status: 'Rejected',
            rejectionReason: result.value,
          });
          toast.error(`${vendor.businessName} ${t('vendorRejectedSuccess')}`);
          fetchVendors();
        } catch (err) {
          toast.error(err.message || 'Update failed');
        }
      }
    });
  };

  const handleResubmit = (vendor) => {
    Swal.fire({
      title: t('resubmitVendorTitle'),
      input: 'textarea',
      inputLabel: t('resubmitVendorLabel'),
      inputPlaceholder: t('resubmitVendorPlaceholder'),
      showCancelButton: true,
      confirmButtonColor: '#d97706',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('resubmitVendorBtn'),
      cancelButtonText: t('cancel'),
      inputValidator: (value) => {
        if (!value) {
          return isEnglish ? 'Please specify what needs to be resubmitted!' : 'कृपया विवरण लिखें कि क्या री-सबमिट करना है!';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminPanelApi.updateVendorStatus(vendor._id, {
            status: 'Resubmit',
            rejectionReason: result.value,
          });
          toast(t('vendorResubmitSuccess'), { icon: '🔄' });
          fetchVendors();
        } catch (err) {
          toast.error(err.message || 'Update failed');
        }
      }
    });
  };

  const handleDeleteVendor = (vendor) => {
    Swal.fire({
      title: t('deleteVendorTitle'),
      text: `${t('deleteVendorText')} (${vendor.businessName})`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('delete'),
      cancelButtonText: t('cancel')
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminPanelApi.deleteVendor(vendor._id);
          toast.success(t('vendorDeletedSuccess'));
          fetchVendors();
        } catch (err) {
          toast.error(err.message || 'Delete failed');
        }
      }
    });
  };

  const handleCommissionSettings = (vendor) => {
    Swal.fire({
      title: `${vendor.businessName} - ${t('deliveryCommissionSettings')}`,
      html: `
        <div style="text-align: left; font-size: 13px;">
          <label style="font-weight: bold; display: block; margin-bottom: 4px;">${t('freeDeliveryDistanceKm')}</label>
          <input id="swal-free-km" type="number" class="swal2-input" value="${vendor.freeDeliveryKm || 5}" style="margin: 0 0 12px 0; width: 100%;">
          
          <label style="font-weight: bold; display: block; margin-bottom: 4px;">${t('extraChargePerKm')}</label>
          <input id="swal-km-charge" type="number" class="swal2-input" value="${vendor.perKmCharge || 15}" style="margin: 0 0 12px 0; width: 100%;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#E65100',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('update'),
      cancelButtonText: t('cancel'),
      preConfirm: () => {
        const freeKm = document.getElementById('swal-free-km').value;
        const kmCharge = document.getElementById('swal-km-charge').value;
        return { freeKm: parseFloat(freeKm), kmCharge: parseFloat(kmCharge) };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminPanelApi.updateVendorStatus(vendor._id, {
            freeDeliveryKm: result.value.freeKm,
            perKmCharge: result.value.kmCharge,
          });
          toast.success(t('deliverySettingsUpdated'));
          fetchVendors();
        } catch (err) {
          toast.error(err.message || 'Update failed');
        }
      }
    });
  };

  // Dynamically populated Add Vendor Modal using DB categories
  const handleAddNewVendorModal = () => {
    // Build options from live categories in database
    let categoryOptionsHtml = '';
    if (categories.length > 0) {
      categoryOptionsHtml = categories.map(c => `
        <option value="${c.name}">${c.name} ${c.hindiName ? `(${c.hindiName})` : ''}</option>
      `).join('');
    } else {
      categoryOptionsHtml = `
        <option value="Brick Kiln (Bhatta)">Brick Kiln (Bhatta / ईंट भट्ठा)</option>
        <option value="Building Material Shop">Building Material Shop (सीमेंट, मौरंग दुकान)</option>
        <option value="Material Supplier">Material Supplier (थोक सप्लायर)</option>
      `;
    }

    Swal.fire({
      title: t('addVendorBtn'),
      html: `
        <div style="text-align: left; font-size: 12px; display: flex; flex-direction: column; gap: 8px;">
          <label><b>${isEnglish ? 'Select Material Category (From Database):' : 'कैटेगरी चुनें (डेटाबेस से डायनामिक):'}</b></label>
          <select id="swal-category" class="swal2-input" style="margin: 0; width: 100%; font-weight: bold; color: #E65100;">
            ${categoryOptionsHtml}
          </select>

          <label><b>${isEnglish ? 'Shop / Bhattha Name:' : 'दुकान / भट्ठा का नाम:'}</b></label>
          <input id="swal-biz-name" class="swal2-input" placeholder="उदा. माँ भवानी ईंट उद्योग" style="margin: 0; width: 100%;">

          <label><b>${isEnglish ? 'Owner Full Name:' : 'मालिक का पूरा नाम:'}</b></label>
          <input id="swal-owner-name" class="swal2-input" placeholder="उदा. राजेश कुमार" style="margin: 0; width: 100%;">

          <label><b>${isEnglish ? 'Mobile Number (10 Digits):' : 'मोबाइल नंबर:'}</b></label>
          <input id="swal-mobile" class="swal2-input" placeholder="9876543210" style="margin: 0; width: 100%;">

          <label><b>${isEnglish ? 'Full Address:' : 'दुकान/भट्ठा का पूरा पता:'}</b></label>
          <input id="swal-address" class="swal2-input" placeholder="उदा. फैजाबाद रोड, चिनहट, लखनऊ" style="margin: 0; width: 100%;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#E65100',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('save'),
      cancelButtonText: t('cancel'),
      preConfirm: () => {
        const selectedCategory = document.getElementById('swal-category').value;
        const businessName = document.getElementById('swal-biz-name').value;
        const ownerFullName = document.getElementById('swal-owner-name').value;
        const mobileNumber = document.getElementById('swal-mobile').value;
        const fullShopAddress = document.getElementById('swal-address').value;

        if (!businessName || !ownerFullName || !mobileNumber) {
          Swal.showValidationMessage(isEnglish ? 'Please fill required fields!' : 'कृपया आवश्यक विवरण भरें!');
          return false;
        }

        return {
          businessName,
          ownerFullName,
          mobileNumber,
          businessType: selectedCategory,
          businessCategories: [selectedCategory],
          fullShopAddress,
          status: 'Approved',
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminPanelApi.createVendor(result.value);
          toast.success(isEnglish ? 'Vendor registered successfully!' : 'वेंडर सफलतापूर्वक रजिस्टर किया गया!');
          fetchVendors();
        } catch (err) {
          toast.error(err.message || 'Failed to create vendor');
        }
      }
    });
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('vendorTitle')}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('vendorSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handleAddNewVendorModal}
            className="px-4 py-2 bg-primary hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <FiPlus size={16} />
            <span>{t('addVendorBtn')}</span>
          </button>
          <button
            onClick={fetchVendors}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2"
          >
            <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{t('refresh')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar with Dynamic Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchVendorPlaceholder')}
              className="w-full bg-slate-50 pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <button type="submit" className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-xl">
            {t('search')}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Dynamic Category Filter Dropdown from Database */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <FiLayers size={13} />
              <span>{isEnglish ? 'Category:' : 'कैटेगरी:'}</span>
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:border-primary"
            >
              <option value="All">{isEnglish ? 'All Categories' : 'सभी कैटेगरी'}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name} {cat.hindiName ? `(${cat.hindiName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Pending', 'Approved', 'Rejected', 'Resubmit'].map(status => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === status 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'All' ? t('allVendors') :
                 status === 'Pending' ? (isEnglish ? 'Pending' : 'पेंडिंग (Pending)') :
                 status === 'Approved' ? (isEnglish ? 'Approved' : 'स्वीकृत (Approved)') :
                 status === 'Rejected' ? (isEnglish ? 'Rejected' : 'अस्वीकृत (Rejected)') : 
                 (isEnglish ? 'Resubmit' : 'री-सबमिट (Resubmit)')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <Stack spacing={4}>
              <Skeleton height="40px" />
              <Skeleton height="40px" />
              <Skeleton height="40px" />
            </Stack>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FiAlertTriangle size={44} className="mx-auto mb-3 opacity-40 text-amber-500" />
            <p className="text-sm font-bold text-slate-700">{t('noVendorsFound')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('noVendorsFoundSub')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table variant="simple" size="sm">
              <Thead bg="slate.50">
                <Tr>
                  <Th color="slate.500" fontSize="11px">{t('colShopDetails')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colOwnerContact')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colAddressArea')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colDocKYC')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('status')}</Th>
                  <Th color="slate.500" fontSize="11px" textAlign="right">{t('colAdminAction')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentVendors.map((vendor) => (
                  <Tr key={vendor._id} _hover={{ bg: 'slate.50' }}>
                    {/* Business Info */}
                    <Td py={3}>
                      <div>
                        <p className="font-bold text-xs text-slate-900">{vendor.businessName}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {vendor.businessCategories && vendor.businessCategories.length > 0 ? (
                            vendor.businessCategories.map((c, i) => (
                              <span key={i} className="inline-block px-2 py-0.5 bg-orange-50 text-primary border border-orange-200/60 rounded text-[10px] font-bold">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                              {vendor.businessType}
                            </span>
                          )}
                        </div>
                      </div>
                    </Td>

                    {/* Owner Info */}
                    <Td>
                      <div>
                        <p className="font-semibold text-xs text-slate-800">{vendor.ownerFullName}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <FiPhone size={11} className="text-slate-400" />
                          <span>+91 {vendor.mobileNumber}</span>
                        </p>
                      </div>
                    </Td>

                    {/* Address */}
                    <Td maxW="200px">
                      <p className="text-xs text-slate-700 truncate" title={vendor.fullShopAddress}>
                        {vendor.fullShopAddress}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <FiMapPin size={10} />
                        <span>{vendor.district || vendor.cityTown || (isEnglish ? 'Lucknow' : 'लखनऊ')} - {vendor.pincode}</span>
                      </p>
                    </Td>

                    {/* KYC status */}
                    <Td>
                      <div className="text-[11px] space-y-0.5">
                        <p className="text-slate-600">
                          {isEnglish ? 'Aadhaar:' : 'आधार:'} <span className="font-mono font-semibold">{vendor.aadhaarNumber || t('uploaded')}</span>
                        </p>
                        <p className="text-slate-600">
                          {isEnglish ? 'PAN:' : 'पैन:'} <span className="font-mono font-semibold">{vendor.panNumber || 'N/A'}</span>
                        </p>
                      </div>
                    </Td>

                    {/* Status Badge */}
                    <Td>
                      <Badge
                        colorScheme={
                          vendor.status === 'Approved' ? 'green' :
                          vendor.status === 'Pending' ? 'orange' :
                          vendor.status === 'Rejected' ? 'red' : 'purple'
                        }
                        borderRadius="8px"
                        px={2.5}
                        py={0.5}
                        fontSize="11px"
                      >
                        {vendor.status}
                      </Badge>
                    </Td>

                    {/* Action Buttons */}
                    <Td textAlign="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/vendors/${vendor._id}`)}
                          title="Open 360° Detailed Dashboard & Work Track"
                          className="px-2 py-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-1 shadow-sm transition-all"
                        >
                          <FiExternalLink size={13} />
                          <span>Track 360°</span>
                        </button>

                        <button
                          onClick={() => setSelectedVendor(vendor)}
                          title={t('viewDocsAndDetails')}
                          className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <FiEye size={16} />
                        </button>

                        <button
                          onClick={() => handleCommissionSettings(vendor)}
                          title={t('deliveryCommissionSettings')}
                          className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <FiPercent size={16} />
                        </button>

                        {vendor.status !== 'Approved' && (
                          <button
                            onClick={() => handleApprove(vendor)}
                            title={t('approveVendorBtn')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <FiCheckCircle size={16} />
                          </button>
                        )}

                        {vendor.status !== 'Rejected' && (
                          <button
                            onClick={() => handleReject(vendor)}
                            title={t('rejectVendorBtn')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiXCircle size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handleResubmit(vendor)}
                          title={t('resubmitVendorBtn')}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <FiRepeat size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteVendor(vendor)}
                          title="Delete Vendor"
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
        {vendors.length > itemsPerPage && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{isEnglish ? `Showing ${(page - 1) * itemsPerPage + 1} - ${Math.min(page * itemsPerPage, vendors.length)} of ${vendors.length} vendors` : `कुल ${vendors.length} में से ${(page - 1) * itemsPerPage + 1} - ${Math.min(page * itemsPerPage, vendors.length)} वेंडर्स`}</span>
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

      {/* Vendor KYC Detail Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-1 text-[10px] font-bold bg-primary/10 text-primary rounded-full uppercase">
                  {selectedVendor.businessType}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedVendor.businessName}</h3>
                <p className="text-xs text-slate-500">{isEnglish ? 'Owner: ' : 'मालिक: '} {selectedVendor.ownerFullName} • +91 {selectedVendor.mobileNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedVendor(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Address & Shop Info */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('modalShopAddressTitle')}</h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedVendor.fullShopAddress} ({selectedVendor.district}, {selectedVendor.state} - {selectedVendor.pincode})
              </p>
            </div>

            {/* KYC Documents Details & Uploaded Previews */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('modalKycDocsTitle')}</h4>
              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('aadhaarNumber')}</span>
                  <span className="font-mono font-bold text-slate-800">{selectedVendor.aadhaarNumber || t('notAvailable')}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('panNumber')}</span>
                  <span className="font-mono font-bold text-slate-800">{selectedVendor.panNumber || t('notAvailable')}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('gstinNumber')}</span>
                  <span className="font-mono font-bold text-slate-800">{selectedVendor.gstNumber || t('notApplicable')}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('currentStatus')}</span>
                  <span className="font-bold text-primary">{selectedVendor.status}</span>
                </div>
              </div>

              {/* Real Uploaded Document Files & Images (Categorized in backend uploads folder) */}
              <div className="space-y-3">
                <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  {isEnglish ? 'Uploaded Official Files & Store Pictures:' : 'अपलोड किए गए दस्तावेज़ व दुकान/भट्ठा की फ़ोटो:'}
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Aadhaar Front */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600 block mb-1">Aadhaar Front</span>
                    {selectedVendor.aadhaarFrontImg ? (
                      <a
                        href={getMediaUrl(selectedVendor.aadhaarFrontImg)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <FiEye size={12} /> View File
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Not Uploaded</span>
                    )}
                  </div>

                  {/* Aadhaar Back */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600 block mb-1">Aadhaar Back</span>
                    {selectedVendor.aadhaarBackImg ? (
                      <a
                        href={getMediaUrl(selectedVendor.aadhaarBackImg)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <FiEye size={12} /> View File
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Not Uploaded</span>
                    )}
                  </div>

                  {/* PAN Card */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600 block mb-1">PAN Card</span>
                    {selectedVendor.panCardImg ? (
                      <a
                        href={getMediaUrl(selectedVendor.panCardImg)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <FiEye size={12} /> View File
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Not Uploaded</span>
                    )}
                  </div>

                  {/* Shop Proof / License */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600 block mb-1">Shop / Bhattha Proof</span>
                    {selectedVendor.shopProofDoc ? (
                      <a
                        href={getMediaUrl(selectedVendor.shopProofDoc)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <FiEye size={12} /> View File
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Not Uploaded</span>
                    )}
                  </div>
                </div>

                {/* Additional Store / Bhattha Photos */}
                {selectedVendor.businessPhotos && selectedVendor.businessPhotos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 block mb-2">Bhattha / Yard Photos ({selectedVendor.businessPhotos.length})</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedVendor.businessPhotos.map((imgUrl, i) => (
                        <a
                          key={i}
                          href={getMediaUrl(imgUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-white border border-slate-200 text-xs text-primary font-semibold rounded-lg hover:bg-orange-50 flex items-center gap-1 shadow-sm"
                        >
                          <FiEye size={12} /> Photo #{i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedVendor(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t('close')}
              </button>
              {selectedVendor.status !== 'Approved' && (
                <button
                  onClick={() => { const v = selectedVendor; setSelectedVendor(null); handleApprove(v); }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700"
                >
                  {t('approveVendorBtn')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
