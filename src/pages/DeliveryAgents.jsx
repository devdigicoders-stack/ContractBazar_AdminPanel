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
  FiTruck, 
  FiSearch, 
  FiPhone, 
  FiStar, 
  FiRefreshCw, 
  FiEye, 
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiActivity,
  FiExternalLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminPanelApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function DeliveryAgents() {
  const navigate = useNavigate();
  const { t, isEnglish } = useLanguage();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await adminPanelApi.getDrivers({
        status: statusFilter,
        search: searchTerm,
      });
      if (res.success) {
        setDrivers(res.drivers || []);
      }
    } catch (err) {
      console.error('Failed to load drivers:', err);
      toast.error((isEnglish ? 'Failed to load drivers: ' : 'ड्राइवर्स लोड करने में त्रुटि: ') + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDrivers();
  };

  const totalPages = Math.ceil(drivers.length / itemsPerPage) || 1;
  const currentDrivers = drivers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              {isEnglish ? 'Real-time Tracking' : 'रियल-टाइम ट्रैकिंग'}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isEnglish ? 'Delivery App Fleet' : 'डिलीवरी ऐप फ्लीट'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">{t('driversTitle')}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEnglish 
              ? 'Live tracking and duty status of tractor-trolley and truck drivers registered via the Delivery App.'
              : 'डिलीवरी ऐप से जुड़े ट्रैक्टर-ट्रॉली, डम्पर व ट्रक चालकों की लाइव ट्रैकिंग, ट्रिप्स और ऑन-ड्यूटी स्थिति।'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={fetchDrivers}
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
              placeholder={t('searchDriverPlaceholder')}
              className="w-full bg-slate-50 pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:bg-white focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <button type="submit" className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-xl">
            {t('search')}
          </button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Online', 'Offline'].map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'All' ? t('allDrivers') :
               status === 'Online' ? (isEnglish ? 'Online on Duty' : 'ड्यूटी पर ऑनलाइन') :
               (isEnglish ? 'Offline' : 'ऑफलाइन')}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers Tracking Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8">
            <Stack spacing={4}>
              <Skeleton height="40px" />
              <Skeleton height="40px" />
              <Skeleton height="40px" />
            </Stack>
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FiTruck size={44} className="mx-auto mb-3 opacity-40 text-primary" />
            <p className="text-sm font-bold text-slate-700">{t('noDriversFound')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('noDriversFoundSub')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table variant="simple" size="sm">
              <Thead bg="slate.50">
                <Tr>
                  <Th color="slate.500" fontSize="11px">{t('colDriverName')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colVehicleType')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colVehiclePlate')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colLicenseNo')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colTripsRating')}</Th>
                  <Th color="slate.500" fontSize="11px">{t('colDutyStatus')}</Th>
                  <Th color="slate.500" fontSize="11px">{isEnglish ? 'Location / City' : 'लोकेशन / शहर'}</Th>
                  <Th color="slate.500" fontSize="11px" textAlign="right">{isEnglish ? 'Live Track' : 'लाइव ट्रैक'}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentDrivers.map((driver) => (
                  <Tr key={driver._id} _hover={{ bg: 'slate.50' }}>
                    <Td py={3}>
                      <div>
                        <p className="font-bold text-xs text-slate-900">{driver.name}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <FiPhone size={11} className="text-slate-400" />
                          <span>+91 {driver.phone}</span>
                        </p>
                      </div>
                    </Td>

                    <Td fontSize="12px" fontWeight="semibold" color="slate.700">
                      {driver.vehicleType}
                    </Td>

                    <Td fontSize="12px" fontFamily="monospace" fontWeight="bold" color="primary">
                      {driver.vehicleNumber}
                    </Td>

                    <Td fontSize="11px" fontFamily="monospace" color="slate.600">
                      {driver.drivingLicenseNumber}
                    </Td>

                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{driver.totalTripsCompleted || 0} {isEnglish ? 'trips' : 'ट्रिप्स'}</span>
                        <span className="flex items-center gap-0.5 text-[11px] text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                          <FiStar size={11} className="fill-amber-400" />
                          <span>{driver.rating || 4.8}</span>
                        </span>
                      </div>
                    </Td>

                    <Td>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        driver.isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${driver.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span>{driver.isOnline ? t('onlineNow') : t('offline')}</span>
                      </span>
                    </Td>

                    <Td fontSize="12px" color="slate.600">
                      <span className="flex items-center gap-1">
                        <FiMapPin size={11} className="text-slate-400" />
                        <span>{driver.city || 'Lucknow'}, {driver.state || 'UP'}</span>
                      </span>
                    </Td>

                    <Td textAlign="right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/delivery-agents/${driver._id}`)}
                          title="Open 360° Detailed Driver & Trip Track"
                          className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1 shadow-sm transition-all"
                        >
                          <FiExternalLink size={13} />
                          <span>Track 360°</span>
                        </button>
                        <button
                          onClick={() => setSelectedDriver(driver)}
                          title={isEnglish ? "Quick Modal View" : "त्वरित विवरण देखें"}
                          className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <FiEye size={16} />
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
        {drivers.length > itemsPerPage && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{isEnglish ? `Showing ${(page - 1) * itemsPerPage + 1} - ${Math.min(page * itemsPerPage, drivers.length)} of ${drivers.length} drivers` : `कुल ${drivers.length} में से ${(page - 1) * itemsPerPage + 1} - ${Math.min(page * itemsPerPage, drivers.length)} चालक`}</span>
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

      {/* Driver Live Tracking Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full">
                  {selectedDriver.vehicleType}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedDriver.name}</h3>
                <p className="text-xs text-slate-500">+91 {selectedDriver.phone}</p>
              </div>
              <button 
                onClick={() => setSelectedDriver(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('colVehiclePlate')}</span>
                <span className="font-mono font-bold text-slate-900">{selectedDriver.vehicleNumber}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('colLicenseNo')}</span>
                <span className="font-mono font-bold text-slate-900">{selectedDriver.drivingLicenseNumber}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{isEnglish ? 'Duty Status' : 'ड्यूटी स्थिति'}</span>
                <span className={`font-bold ${selectedDriver.isOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {selectedDriver.isOnline ? (isEnglish ? '🟢 Online on Duty' : '🟢 ऑनलाइन ऑन-ड्यूटी') : (isEnglish ? '⚪ Offline' : '⚪ ऑफलाइन')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{isEnglish ? 'Trips & Rating' : 'ट्रिप्स एवं रेटिंग'}</span>
                <span className="font-bold text-slate-900">{selectedDriver.totalTripsCompleted || 0} Trips • ⭐ {selectedDriver.rating || 4.8}</span>
              </div>
            </div>

            {/* GPS Coordinates preview */}
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{isEnglish ? 'GPS Coordinates' : 'जीपीएस निर्देशांक'}</p>
                <p className="font-mono text-emerald-400 font-bold mt-0.5">
                  {selectedDriver.currentLocation?.coordinates ? `${selectedDriver.currentLocation.coordinates[1]}° N, ${selectedDriver.currentLocation.coordinates[0]}° E` : '26.8467° N, 80.9462° E'}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold">
                {isEnglish ? 'Live Telemetry' : 'लाइव टेलीमेट्री'}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedDriver(null)}
                className="w-full py-2.5 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
