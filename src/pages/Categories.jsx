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
import { FiPlus, FiEdit2, FiTrash2, FiPercent, FiLayers, FiRefreshCw, FiUsers } from 'react-icons/fi';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { adminPanelApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t, isEnglish } = useLanguage();

  const fetchCategories = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const res = await adminPanelApi.getCategories();
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      toast.error(isEnglish ? 'Error loading categories: ' + (err.message || 'Server error') : 'कैटेगरी लोड करने में त्रुटि: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    Swal.fire({
      title: t('addCatModalTitle'),
      html: `
        <div style="text-align: left; font-size: 13px;">
          <label style="font-weight: bold; display: block; margin-bottom: 4px;">${t('lblCatName')}</label>
          <input id="swal-cat-name" class="swal2-input" placeholder="e.g. Bricks, Cement" style="margin: 0 0 12px 0; width: 100%;">

          <label style="font-weight: bold; display: block; margin-bottom: 4px;">${t('lblCatHindiName')}</label>
          <input id="swal-cat-hindi" class="swal2-input" placeholder="उदा. ईंट, सीमेंट" style="margin: 0 0 12px 0; width: 100%;">
          
          <label style="font-weight: bold; display: block; margin-bottom: 4px;">${t('lblCommissionType')}</label>
          <select id="swal-comm-type" class="swal2-select" style="margin: 0 0 12px 0; width: 100%;">
            <option value="percentage">${t('percentage')}</option>
            <option value="fixed">${t('fixedPerUnit')}</option>
          </select>
          
          <label style="font-weight: bold; display: block; margin-bottom: 4px;">${t('lblCommissionRate')}</label>
          <input id="swal-comm-rate" type="number" step="0.5" class="swal2-input" placeholder="e.g. 5 or 15" style="margin: 0 0 12px 0; width: 100%;">

          <label style="font-weight: bold; display: block; margin-bottom: 4px;">${t('lblUnits')}</label>
          <input id="swal-cat-units" class="swal2-input" placeholder="Piece, 1000 Pcs, Bag, CFT, Ton" style="margin: 0; width: 100%;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: t('save'),
      cancelButtonText: t('cancel'),
      confirmButtonColor: '#E65100',
      preConfirm: () => {
        const name = document.getElementById('swal-cat-name').value.trim();
        const hindiName = document.getElementById('swal-cat-hindi').value.trim();
        const commissionType = document.getElementById('swal-comm-type').value;
        const commissionRate = document.getElementById('swal-comm-rate').value.trim();
        const unitsRaw = document.getElementById('swal-cat-units').value.trim();

        if (!name) {
          Swal.showValidationMessage(isEnglish ? 'Category name is required' : 'कृपया कैटेगरी का नाम अवश्य लिखें!');
          return false;
        }
        if (!commissionRate || isNaN(commissionRate)) {
          Swal.showValidationMessage(isEnglish ? 'Valid commission rate is required' : 'कृपया मान्य कमीशन दर दर्ज करें!');
          return false;
        }

        const units = unitsRaw ? unitsRaw.split(',').map(u => u.trim()).filter(Boolean) : [];

        return {
          name,
          hindiName,
          commissionType,
          commissionRate: parseFloat(commissionRate),
          units,
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await adminPanelApi.createCategory(result.value);
          toast.success(res.message || (isEnglish ? 'Category created successfully!' : 'नई कैटेगरी सफलतापूर्वक जोड़ दी गई!'));
          fetchCategories(true);
        } catch (err) {
          toast.error(err.message || 'Category creation failed');
        }
      }
    });
  };

  const handleEditCategory = (cat) => {
    const currentUnits = Array.isArray(cat.units) ? cat.units.join(', ') : '';

    Swal.fire({
      title: `${cat.name} - ${t('update')}`,
      html: `
        <div style="text-align: left; font-size: 13px;">
          <label style="font-weight: bold; display: block; margin-bottom: 4px;">${t('colCatName')}:</label>
          <input id="swal-edit-name" class="swal2-input" value="${cat.name}" style="margin: 0 0 12px 0; width: 100%;">

          <label style="font-weight: bold; display: block; margin-bottom: 4px;">${t('lblCommissionType')}</label>
          <select id="swal-edit-comm-type" class="swal2-select" style="margin: 0 0 12px 0; width: 100%;">
            <option value="percentage" ${cat.commissionType === 'percentage' ? 'selected' : ''}>${t('percentage')}</option>
            <option value="fixed" ${cat.commissionType === 'fixed' ? 'selected' : ''}>${t('fixedPerUnit')}</option>
          </select>
          
          <label style="font-weight: bold; display: block; margin-bottom: 4px;">${t('lblCommissionRate')}</label>
          <input id="swal-edit-comm-rate" type="number" step="0.5" class="swal2-input" value="${cat.commissionRate}" style="margin: 0 0 12px 0; width: 100%;">

          <label style="font-weight: bold; display: block; margin-bottom: 4px;">${t('lblStatus')}</label>
          <select id="swal-edit-status" class="swal2-select" style="margin: 0 0 12px 0; width: 100%;">
            <option value="Active" ${cat.status === 'Active' ? 'selected' : ''}>${t('active')}</option>
            <option value="Inactive" ${cat.status === 'Inactive' ? 'selected' : ''}>${t('inactive')}</option>
          </select>

          <label style="font-weight: bold; display: block; margin-bottom: 4px;">${t('lblUnits')}</label>
          <input id="swal-edit-units" class="swal2-input" value="${currentUnits}" placeholder="Piece, Bag, CFT, Ton" style="margin: 0; width: 100%;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: t('update'),
      cancelButtonText: t('cancel'),
      confirmButtonColor: '#E65100',
      preConfirm: () => {
        const name = document.getElementById('swal-edit-name').value.trim();
        const commissionType = document.getElementById('swal-edit-comm-type').value;
        const commissionRate = document.getElementById('swal-edit-comm-rate').value.trim();
        const status = document.getElementById('swal-edit-status').value;
        const unitsRaw = document.getElementById('swal-edit-units').value.trim();

        if (!name || !commissionRate) {
          Swal.showValidationMessage(isEnglish ? 'Please fill all required fields' : 'कृपया सभी फ़ील्ड भरें');
          return false;
        }

        const units = unitsRaw ? unitsRaw.split(',').map(u => u.trim()).filter(Boolean) : [];

        return {
          name,
          commissionType,
          commissionRate: parseFloat(commissionRate),
          status,
          units,
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await adminPanelApi.updateCategory(cat._id, result.value);
          toast.success(res.message || (isEnglish ? 'Category updated successfully!' : 'कमीशन दर अपडेट कर दी गई है!'));
          fetchCategories(true);
        } catch (err) {
          toast.error(err.message || 'Update failed');
        }
      }
    });
  };

  const handleDeleteCategory = (cat) => {
    Swal.fire({
      title: t('deleteCatConfirmTitle'),
      text: `${cat.name}: ${t('deleteCatConfirmText')}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('delete'),
      cancelButtonText: t('cancel')
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await adminPanelApi.deleteCategory(cat._id);
          toast.success(res.message || (isEnglish ? 'Category deleted successfully!' : 'कैटेगरी सफलतापूर्वक हटा दी गई!'));
          fetchCategories(true);
        } catch (err) {
          toast.error(err.message || 'Delete failed');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full uppercase tracking-wider">
              {t('catHeaderTag')}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {t('total')} {categories.length} {isEnglish ? 'Categories' : 'कैटेगरी'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">{t('catTitle')}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('catSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCategories(true)}
            disabled={refreshing}
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <FiRefreshCw size={14} className={refreshing ? "animate-spin text-primary" : ""} />
            <span>{refreshing ? t('refreshing') : t('refresh')}</span>
          </button>
          <button
            onClick={handleAddCategory}
            className="bg-primary hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 transition-all"
          >
            <FiPlus size={16} />
            <span>{t('addCategoryBtn')}</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <Stack spacing={4}>
              <Skeleton height="40px" />
              <Skeleton height="40px" />
              <Skeleton height="40px" />
            </Stack>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FiLayers size={44} className="mx-auto mb-3 opacity-40 text-primary" />
            <p className="text-sm font-bold text-slate-700">{t('noCategoriesYet')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('noCategoriesYetSub')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table variant="simple" size="sm">
              <Thead bg="slate.50">
                <Tr>
                  <Th color="slate.500" fontSize="11px">{t('colCatName')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colCommissionType')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colCommissionRate')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colAssociatedVendors')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colStandardUnits')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('status')}</Th>
                  <Th color="slate.500" fontSize="11px" textAlign="right">{t('action')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.map((cat) => (
                  <Tr key={cat._id} _hover={{ bg: 'slate.50' }}>
                    {/* Category Name */}
                    <Td py={3.5}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {cat.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900">{cat.name}</p>
                          {cat.description && (
                            <p className="text-[10px] text-slate-400 max-w-xs truncate">{cat.description}</p>
                          )}
                        </div>
                      </div>
                    </Td>

                    {/* Commission Type */}
                    <Td fontSize="12px" textTransform="capitalize">
                      <span className="font-semibold text-slate-700">
                        {cat.commissionType === 'percentage' ? t('percentage') : t('fixedPerUnit')}
                      </span>
                    </Td>

                    {/* Commission Rate */}
                    <Td fontWeight="bold" fontSize="13px" color="orange.600">
                      <span className="px-2 py-0.5 bg-orange-50 text-primary rounded-md border border-orange-200">
                        {cat.commissionType === 'percentage' ? `${cat.commissionRate}%` : `₹${cat.commissionRate}`}
                      </span>
                    </Td>

                    {/* Associated Vendors Count */}
                    <Td fontSize="12px">
                      <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                        <FiUsers size={13} className="text-slate-400" />
                        <span>{cat.totalVendors || 0} {isEnglish ? 'Vendors' : 'वेंडर्स'}</span>
                      </div>
                    </Td>

                    {/* Units */}
                    <Td maxW="200px">
                      {Array.isArray(cat.units) && cat.units.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cat.units.slice(0, 3).map((u, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                              {u}
                            </span>
                          ))}
                          {cat.units.length > 3 && (
                            <span className="text-[10px] text-slate-400">+{cat.units.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Default</span>
                      )}
                    </Td>

                    {/* Status */}
                    <Td>
                      <Badge 
                        colorScheme={cat.status === 'Active' ? 'green' : 'gray'} 
                        borderRadius="6px" 
                        fontSize="11px"
                        px={2}
                        py={0.5}
                      >
                        {cat.status === 'Active' ? t('active') : t('inactive')}
                      </Badge>
                    </Td>

                    {/* Actions */}
                    <Td textAlign="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleEditCategory(cat)}
                          title={t('edit')}
                          className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat)}
                          title={t('delete')}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
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
