import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
  Image,
  Tag,
  Divider,
  Stack,
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiPhone,
  FiMapPin,
  FiPackage,
  FiShoppingBag,
  FiTruck,
  FiDollarSign,
  FiPercent,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiExternalLink,
  FiXCircle,
  FiRepeat,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { adminPanelApi } from '../services/api';

export default function VendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVendorDetail();
  }, [id]);

  const handleUpdateStatus = async (newStatus, reason = '') => {
    setActionLoading(true);
    try {
      const res = await adminPanelApi.updateVendorStatus(id, {
        status: newStatus,
        rejectionReason: reason,
      });
      if (res?.success) {
        toast.success(`Vendor marked as ${newStatus}!`);
        fetchVendorDetail();
      } else {
        toast.error(res?.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmApprove = () => {
    Swal.fire({
      title: 'Approve Vendor / Bhattha?',
      text: 'Are you sure all KYC documents and details are verified?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16A34A',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Yes, Approve Vendor',
    }).then((result) => {
      if (result.isConfirmed) {
        handleUpdateStatus('Approved');
      }
    });
  };

  const confirmReject = () => {
    Swal.fire({
      title: 'Reject Vendor Application?',
      input: 'textarea',
      inputLabel: 'Reason for Rejection (e.g. Blurred Aadhaar / Invalid license)',
      inputPlaceholder: 'Enter reason here...',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Reject Application',
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage('Please write a rejection reason');
        }
        return value;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleUpdateStatus('Rejected', result.value);
      }
    });
  };

  const confirmBlock = () => {
    Swal.fire({
      title: 'Block / Suspend Vendor?',
      text: 'This approved vendor will be blocked and will not receive any customer orders.',
      input: 'textarea',
      inputLabel: 'Reason for Blocking (e.g. Fraud / Material Quality Complaints)',
      inputPlaceholder: 'Enter blocking reason...',
      showCancelButton: true,
      confirmButtonColor: '#000000',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Yes, Block Vendor',
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage('Please provide a reason to block');
        }
        return value;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleUpdateStatus('Blocked', result.value);
      }
    });
  };

  const confirmUnblock = () => {
    Swal.fire({
      title: 'Unblock Vendor?',
      text: 'Restore this vendor account back to Approved status?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16A34A',
      cancelButtonColor: '#94A3B8',
      confirmButtonText: 'Yes, Unblock & Approve',
    }).then((result) => {
      if (result.isConfirmed) {
        handleUpdateStatus('Approved');
      }
    });
  };

  useEffect(() => {
    fetchVendorDetail();
  }, [id]);

  const fetchVendorDetail = async () => {
    setLoading(true);
    try {
      const res = await adminPanelApi.getVendorDetail360(id);
      if (res?.success) {
        setData(res);
      } else {
        toast.error(res?.message || 'Failed to fetch vendor details');
      }
    } catch (err) {
      toast.error(err.message || 'Error loading vendor details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h="70vh">
        <Spinner size="xl" color="#E65100" thickness="4px" />
      </Center>
    );
  }

  if (!data?.vendor) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="lg" fontWeight="bold" color="red.500">
          Vendor not found!
        </Text>
        <Button mt={4} leftIcon={<FiArrowLeft />} onClick={() => navigate('/vendors')}>
          Back to Vendors
        </Button>
      </Box>
    );
  }

  const { vendor, stats, products = [], orders = [], drivers = [], customers = [] } = data;

  return (
    <Box p={{ base: 4, md: 6 }} maxW="1400px" mx="auto">
      {/* Top Header & Back Button */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Flex align="center" gap={3}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiArrowLeft />}
            onClick={() => navigate('/vendors')}
            borderRadius="8px"
            bg="white"
          >
            Back
          </Button>
          <Box>
            <Flex align="center" gap={2}>
              <Text fontSize="22px" fontWeight="800" color="#0F172A">
                {vendor.businessName}
              </Text>
              <Badge
                colorScheme={
                  vendor.status === 'Approved'
                    ? 'green'
                    : vendor.status === 'Pending'
                    ? 'orange'
                    : 'red'
                }
                px={2.5}
                py={0.5}
                borderRadius="full"
                fontSize="12px"
              >
                {vendor.status}
              </Badge>
              <Badge
                colorScheme={vendor.isStoreOnline ? 'whatsapp' : 'gray'}
                px={2.5}
                py={0.5}
                borderRadius="full"
                fontSize="12px"
              >
                {vendor.isStoreOnline ? 'Store Online' : 'Store Offline'}
              </Badge>
            </Flex>
            <Text fontSize="13px" color="#64748B" mt={0.5}>
              Owner: {vendor.ownerName} • Phone: {vendor.contactNumber} • Registered on:{' '}
              {new Date(vendor.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </Box>
        </Flex>

        <Flex gap={2} align="center" flexWrap="wrap">
          <Tag colorScheme="orange" size="lg" fontWeight="700">
            Commission: {vendor.commissionRate ?? 5}%
          </Tag>

          {/* Verification & Lifecycle Actions */}
          {vendor.status !== 'Approved' && vendor.status !== 'Blocked' && (
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<FiCheckCircle />}
              onClick={confirmApprove}
              isLoading={actionLoading}
              fontWeight="700"
              borderRadius="8px"
            >
              Verify & Approve
            </Button>
          )}

          {/* If Pending/New -> Can Reject */}
          {vendor.status !== 'Approved' && vendor.status !== 'Blocked' && vendor.status !== 'Rejected' && (
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              leftIcon={<FiXCircle />}
              onClick={confirmReject}
              isLoading={actionLoading}
              fontWeight="700"
              borderRadius="8px"
              bg="white"
            >
              Reject
            </Button>
          )}

          {/* If Approved -> Can only BLOCK (Never Reject) */}
          {vendor.status === 'Approved' && (
            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<FiXCircle />}
              onClick={confirmBlock}
              isLoading={actionLoading}
              fontWeight="700"
              borderRadius="8px"
            >
              Block Vendor
            </Button>
          )}

          {/* If Blocked -> Can Unblock back to Approved */}
          {vendor.status === 'Blocked' && (
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<FiCheckCircle />}
              onClick={confirmUnblock}
              isLoading={actionLoading}
              fontWeight="700"
              borderRadius="8px"
            >
              Unblock Vendor
            </Button>
          )}
        </Flex>
      </Flex>

      {/* KPI Cards: Revenue, Commissions, Metrics */}
      <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} spacing={4} mb={6}>
        <Box bg="white" p={4} borderRadius="12px" boxShadow="sm" border="1px solid #E2E8F0">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="12px" fontWeight="600" color="#64748B">
              Gross Sales
            </Text>
            <FiDollarSign color="#E65100" />
          </Flex>
          <Text fontSize="20px" fontWeight="800" color="#0F172A">
            ₹{(stats.totalGrossRevenue || 0).toLocaleString('en-IN')}
          </Text>
          <Text fontSize="11px" color="#16A34A" fontWeight="600" mt={1}>
            Total Value
          </Text>
        </Box>

        <Box bg="#FEF3C7" p={4} borderRadius="12px" boxShadow="sm" border="1px solid #FCD34D">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="12px" fontWeight="700" color="#92400E">
              Admin Commission
            </Text>
            <FiPercent color="#D97706" />
          </Flex>
          <Text fontSize="20px" fontWeight="800" color="#B45309">
            ₹{(stats.totalAdminCommission || 0).toLocaleString('en-IN')}
          </Text>
          <Text fontSize="11px" color="#92400E" fontWeight="600" mt={1}>
            Platform Net Earned
          </Text>
        </Box>

        <Box bg="#DCFCE7" p={4} borderRadius="12px" boxShadow="sm" border="1px solid #86EFAC">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="12px" fontWeight="700" color="#166534">
              Vendor Net Payout
            </Text>
            <FiCheckCircle color="#16A34A" />
          </Flex>
          <Text fontSize="20px" fontWeight="800" color="#15803D">
            ₹{(stats.vendorNetPayout || 0).toLocaleString('en-IN')}
          </Text>
          <Text fontSize="11px" color="#166534" fontWeight="600" mt={1}>
            Vendor Earning
          </Text>
        </Box>

        <Box bg="white" p={4} borderRadius="12px" boxShadow="sm" border="1px solid #E2E8F0">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="12px" fontWeight="600" color="#64748B">
              Total Orders
            </Text>
            <FiShoppingBag color="#3B82F6" />
          </Flex>
          <Text fontSize="20px" fontWeight="800" color="#0F172A">
            {stats.totalOrders}
          </Text>
          <Text fontSize="11px" color="#64748B" mt={1}>
            {stats.deliveredCount} Delivered
          </Text>
        </Box>

        <Box bg="white" p={4} borderRadius="12px" boxShadow="sm" border="1px solid #E2E8F0">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="12px" fontWeight="600" color="#64748B">
              Active Products
            </Text>
            <FiPackage color="#8B5CF6" />
          </Flex>
          <Text fontSize="20px" fontWeight="800" color="#0F172A">
            {stats.totalProducts}
          </Text>
          <Text fontSize="11px" color="#64748B" mt={1}>
            Catalog Items
          </Text>
        </Box>

        <Box bg="white" p={4} borderRadius="12px" boxShadow="sm" border="1px solid #E2E8F0">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="12px" fontWeight="600" color="#64748B">
              Fleet & Drivers
            </Text>
            <FiTruck color="#F59E0B" />
          </Flex>
          <Text fontSize="20px" fontWeight="800" color="#0F172A">
            {stats.totalDrivers}
          </Text>
          <Text fontSize="11px" color="#64748B" mt={1}>
            {stats.totalCustomers} Customers
          </Text>
        </Box>
      </SimpleGrid>

      {/* Tabs Section: Products, Orders, Fleet/Drivers, Customers, KYC Details */}
      <Box bg="white" borderRadius="16px" boxShadow="sm" border="1px solid #E2E8F0" p={5}>
        <Tabs variant="enclosed" colorScheme="orange">
          <TabList>
            <Tab fontWeight="700">Products Listed ({products.length})</Tab>
            <Tab fontWeight="700">Orders History ({orders.length})</Tab>
            <Tab fontWeight="700">Fleet Drivers ({drivers.length})</Tab>
            <Tab fontWeight="700">Customer Base ({customers.length})</Tab>
            <Tab fontWeight="700">KYC & Business Details</Tab>
          </TabList>

          <TabPanels mt={4}>
            {/* TAB 1: PRODUCTS LIST */}
            <TabPanel p={0}>
              {products.length === 0 ? (
                <Text p={6} textAlign="center" color="#94A3B8">
                  No products listed by this vendor yet.
                </Text>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="#F8FAFC">
                      <Tr>
                        <Th>Product</Th>
                        <Th>Category</Th>
                        <Th>Rate / Unit</Th>
                        <Th>Min / Max Qty</Th>
                        <Th>Stock Status</Th>
                        <Th>Free Delivery</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {products.map((p) => (
                        <Tr key={p._id}>
                          <Td fontWeight="700" color="#0F172A">
                            {p.name}
                            {p.brandName && (
                              <Text fontSize="11px" color="#64748B">
                                Brand: {p.brandName}
                              </Text>
                            )}
                          </Td>
                          <Td>
                            <Badge colorScheme="purple">{p.categoryName}</Badge>
                          </Td>
                          <Td fontWeight="700" color="#E65100">
                            ₹{p.price} / {p.unit}
                          </Td>
                          <Td fontSize="12px">
                            Min: {p.minOrderQuantity || 1} {p.unit}
                          </Td>
                          <Td>
                            <Badge colorScheme={p.inStock ? 'green' : 'red'}>
                              {p.inStock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </Td>
                          <Td fontSize="12px">
                            {p.freeDeliveryKm ? `${p.freeDeliveryKm} KM Free` : 'Standard'}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </TabPanel>

            {/* TAB 2: ORDERS HISTORY */}
            <TabPanel p={0}>
              {orders.length === 0 ? (
                <Text p={6} textAlign="center" color="#94A3B8">
                  No orders placed for this vendor yet.
                </Text>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="#F8FAFC">
                      <Tr>
                        <Th>Order ID</Th>
                        <Th>Customer</Th>
                        <Th>Items Ordered</Th>
                        <Th>Total Amount</Th>
                        <Th>Admin Commission</Th>
                        <Th>Status</Th>
                        <Th>Driver Assigned</Th>
                        <Th>Date</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {orders.map((o) => (
                        <Tr key={o._id}>
                          <Td fontWeight="700" color="#0F172A">
                            {o.orderId}
                          </Td>
                          <Td>
                            <Text fontWeight="600">{o.customer}</Text>
                            <Text fontSize="11px" color="#64748B">
                              {o.customerPhone}
                            </Text>
                          </Td>
                          <Td maxW="220px" isTruncated fontSize="12px">
                            {o.items}
                          </Td>
                          <Td fontWeight="700" color="#0F172A">
                            ₹{(o.totalAmount || 0).toLocaleString('en-IN')}
                          </Td>
                          <Td fontWeight="700" color="#D97706">
                            ₹{(o.adminCommission || 0).toLocaleString('en-IN')}
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                o.status === 'Delivered'
                                  ? 'green'
                                  : o.status === 'Cancelled'
                                  ? 'red'
                                  : o.status === 'Dispatched'
                                  ? 'blue'
                                  : 'orange'
                              }
                            >
                              {o.status}
                            </Badge>
                          </Td>
                          <Td fontSize="12px">
                            {o.driver && o.driver !== 'Not Assigned' ? (
                              <Text fontWeight="600" color="#2563EB">
                                {o.driver} ({o.vehicleNumber || 'No plate'})
                              </Text>
                            ) : (
                              <Text color="#94A3B8">Not Assigned</Text>
                            )}
                          </Td>
                          <Td fontSize="11px" color="#64748B">
                            {new Date(o.createdAt).toLocaleDateString('en-IN')}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </TabPanel>

            {/* TAB 3: FLEET DRIVERS */}
            <TabPanel p={0}>
              {drivers.length === 0 ? (
                <Text p={6} textAlign="center" color="#94A3B8">
                  No drivers/tractors registered in this vendor's fleet yet.
                </Text>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="#F8FAFC">
                      <Tr>
                        <Th>Driver Name</Th>
                        <Th>Mobile Phone</Th>
                        <Th>Vehicle Type</Th>
                        <Th>Vehicle Plate No.</Th>
                        <Th>Driving License</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {drivers.map((d) => (
                        <Tr key={d._id}>
                          <Td fontWeight="700" color="#0F172A">
                            {d.name}
                          </Td>
                          <Td fontWeight="600">{d.phone}</Td>
                          <Td>
                            <Badge colorScheme="blue">{d.vehicleType || 'Tractor'}</Badge>
                          </Td>
                          <Td fontWeight="700" color="#E65100">
                            {d.vehicleNumber}
                          </Td>
                          <Td fontSize="12px">{d.drivingLicenseNumber || 'N/A'}</Td>
                          <Td>
                            <Badge colorScheme={d.isOnline ? 'green' : 'gray'}>
                              {d.isOnline ? 'Active / Online' : 'Offline'}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </TabPanel>

            {/* TAB 4: CUSTOMERS BASE */}
            <TabPanel p={0}>
              {customers.length === 0 ? (
                <Text p={6} textAlign="center" color="#94A3B8">
                  No customer orders recorded yet.
                </Text>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="#F8FAFC">
                      <Tr>
                        <Th>Customer Name</Th>
                        <Th>Mobile Phone</Th>
                        <Th>Total Orders Placed</Th>
                        <Th>Total Spent</Th>
                        <Th>Last Order Date</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {customers.map((c, idx) => (
                        <Tr key={idx}>
                          <Td fontWeight="700" color="#0F172A">
                            {c.name}
                          </Td>
                          <Td fontWeight="600">{c.phone}</Td>
                          <Td fontWeight="700" color="#2563EB">
                            {c.totalOrders} Orders
                          </Td>
                          <Td fontWeight="700" color="#16A34A">
                            ₹{c.totalSpent.toLocaleString('en-IN')}
                          </Td>
                          <Td fontSize="12px" color="#64748B">
                            {new Date(c.lastOrderDate).toLocaleDateString('en-IN')}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </TabPanel>

            {/* TAB 5: KYC & BUSINESS DETAILS */}
            <TabPanel p={2}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box bg="#F8FAFC" p={4} borderRadius="12px" border="1px solid #E2E8F0">
                  <Text fontWeight="800" fontSize="15px" color="#0F172A" mb={3}>
                    Business & Bank Info
                  </Text>
                  <Stack spacing={2} fontSize="13px">
                    <Flex justify="space-between">
                      <Text color="#64748B">Shop / Bhattha Address:</Text>
                      <Text fontWeight="600">{vendor.fullShopAddress || 'N/A'}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="#64748B">City / District:</Text>
                      <Text fontWeight="600">{vendor.cityTown || 'Lucknow'}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="#64748B">Business Categories:</Text>
                      <Text fontWeight="600">
                        {Array.isArray(vendor.businessCategories)
                          ? vendor.businessCategories.join(', ')
                          : vendor.businessCategories || 'Building Materials'}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="#64748B">Bank Account No:</Text>
                      <Text fontWeight="600">{vendor.bankAccountNumber || 'Not provided'}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="#64748B">Bank IFSC:</Text>
                      <Text fontWeight="600">{vendor.bankIfscCode || 'Not provided'}</Text>
                    </Flex>
                  </Stack>
                </Box>

                <Box bg="#F8FAFC" p={4} borderRadius="12px" border="1px solid #E2E8F0">
                  <Text fontWeight="800" fontSize="15px" color="#0F172A" mb={3}>
                    KYC Documents Attached
                  </Text>
                  <SimpleGrid columns={2} spacing={3}>
                    {vendor.aadhaarFrontImg && (
                      <Box bg="white" p={2} borderRadius="8px" textAlign="center" border="1px solid #CBD5E1">
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontSize="11px" fontWeight="700">Aadhaar Front</Text>
                          <a href={`http://localhost:5000${vendor.aadhaarFrontImg}`} target="_blank" rel="noreferrer">
                            <FiExternalLink size={12} color="#2563EB" />
                          </a>
                        </Flex>
                        <Image
                          src={`http://localhost:5000${vendor.aadhaarFrontImg}`}
                          fallbackSrc="https://placehold.co/150x90?text=Aadhaar"
                          h="120px"
                          w="100%"
                          objectFit="contain"
                          bg="#F1F5F9"
                          borderRadius="4px"
                        />
                      </Box>
                    )}
                    {vendor.aadhaarBackImg && (
                      <Box bg="white" p={2} borderRadius="8px" textAlign="center" border="1px solid #CBD5E1">
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontSize="11px" fontWeight="700">Aadhaar Back</Text>
                          <a href={`http://localhost:5000${vendor.aadhaarBackImg}`} target="_blank" rel="noreferrer">
                            <FiExternalLink size={12} color="#2563EB" />
                          </a>
                        </Flex>
                        <Image
                          src={`http://localhost:5000${vendor.aadhaarBackImg}`}
                          fallbackSrc="https://placehold.co/150x90?text=Aadhaar+Back"
                          h="120px"
                          w="100%"
                          objectFit="contain"
                          bg="#F1F5F9"
                          borderRadius="4px"
                        />
                      </Box>
                    )}
                    {vendor.panCardImg && (
                      <Box bg="white" p={2} borderRadius="8px" textAlign="center" border="1px solid #CBD5E1">
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontSize="11px" fontWeight="700">PAN Card</Text>
                          <a href={`http://localhost:5000${vendor.panCardImg}`} target="_blank" rel="noreferrer">
                            <FiExternalLink size={12} color="#2563EB" />
                          </a>
                        </Flex>
                        <Image
                          src={`http://localhost:5000${vendor.panCardImg}`}
                          fallbackSrc="https://placehold.co/150x90?text=PAN+Card"
                          h="120px"
                          w="100%"
                          objectFit="contain"
                          bg="#F1F5F9"
                          borderRadius="4px"
                        />
                      </Box>
                    )}
                    {vendor.shopProofDoc && (
                      <Box bg="white" p={2} borderRadius="8px" textAlign="center" border="1px solid #CBD5E1">
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontSize="11px" fontWeight="700">Shop / Bhattha Proof</Text>
                          <a href={`http://localhost:5000${vendor.shopProofDoc}`} target="_blank" rel="noreferrer">
                            <FiExternalLink size={12} color="#2563EB" />
                          </a>
                        </Flex>
                        <Image
                          src={`http://localhost:5000${vendor.shopProofDoc}`}
                          fallbackSrc="https://placehold.co/150x90?text=Shop+Doc"
                          h="120px"
                          w="100%"
                          objectFit="contain"
                          bg="#F1F5F9"
                          borderRadius="4px"
                        />
                      </Box>
                    )}
                  </SimpleGrid>
                </Box>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}

