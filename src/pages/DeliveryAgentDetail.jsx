import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
  Stack,
  Tag,
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiTruck,
  FiPhone,
  FiCheckCircle,
  FiDollarSign,
  FiClock,
  FiHome,
  FiMapPin,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminPanelApi } from '../services/api';

export default function DeliveryAgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverDetail();
  }, [id]);

  const fetchDriverDetail = async () => {
    setLoading(true);
    try {
      const res = await adminPanelApi.getDriverDetail360(id);
      if (res?.success) {
        setData(res);
      } else {
        toast.error(res?.message || 'Failed to fetch driver details');
      }
    } catch (err) {
      toast.error(err.message || 'Error loading driver details');
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

  if (!data?.driver) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="lg" fontWeight="bold" color="red.500">
          Delivery Partner not found!
        </Text>
        <Button mt={4} leftIcon={<FiArrowLeft />} onClick={() => navigate('/delivery-agents')}>
          Back to Delivery Agents
        </Button>
      </Box>
    );
  }

  const { driver, vendor, stats, assignedOrders = [] } = data;

  return (
    <Box p={{ base: 4, md: 6 }} maxW="1300px" mx="auto">
      {/* Top Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Flex align="center" gap={3}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiArrowLeft />}
            onClick={() => navigate('/delivery-agents')}
            borderRadius="8px"
            bg="white"
          >
            Back
          </Button>
          <Box>
            <Flex align="center" gap={2}>
              <Text fontSize="22px" fontWeight="800" color="#0F172A">
                {driver.name}
              </Text>
              <Badge
                colorScheme={driver.isOnline ? 'green' : 'gray'}
                px={2.5}
                py={0.5}
                borderRadius="full"
                fontSize="12px"
              >
                {driver.isOnline ? 'Active / Online' : 'Offline'}
              </Badge>
              <Badge colorScheme="blue" px={2.5} py={0.5} borderRadius="full" fontSize="12px">
                {driver.vehicleType || 'Tractor-Trolley'}
              </Badge>
            </Flex>
            <Text fontSize="13px" color="#64748B" mt={0.5}>
              Mobile: {driver.phone} • Plate No: {driver.vehicleNumber} • DL: {driver.drivingLicenseNumber || 'N/A'}
            </Text>
          </Box>
        </Flex>

        <Tag colorScheme="purple" size="lg" fontWeight="700">
          Connected Vendor: {vendor?.businessName || driver.vendorName || 'Not Attached'}
        </Tag>
      </Flex>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={4} mb={6}>
        <Box bg="white" p={4} borderRadius="12px" boxShadow="sm" border="1px solid #E2E8F0">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="12px" fontWeight="600" color="#64748B">
              Total Assigned Trips
            </Text>
            <FiTruck color="#3B82F6" />
          </Flex>
          <Text fontSize="22px" fontWeight="800" color="#0F172A">
            {stats.totalTrips}
          </Text>
          <Text fontSize="11px" color="#64748B" mt={1}>
            Trips assigned so far
          </Text>
        </Box>

        <Box bg="#DCFCE7" p={4} borderRadius="12px" boxShadow="sm" border="1px solid #86EFAC">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="12px" fontWeight="700" color="#166534">
              Successfully Delivered
            </Text>
            <FiCheckCircle color="#16A34A" />
          </Flex>
          <Text fontSize="22px" fontWeight="800" color="#15803D">
            {stats.completedTrips}
          </Text>
          <Text fontSize="11px" color="#166534" mt={1}>
            Completed Deliveries
          </Text>
        </Box>

        <Box bg="#FEF3C7" p={4} borderRadius="12px" boxShadow="sm" border="1px solid #FCD34D">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="12px" fontWeight="700" color="#92400E">
              Active / In-Transit
            </Text>
            <FiClock color="#D97706" />
          </Flex>
          <Text fontSize="22px" fontWeight="800" color="#B45309">
            {stats.activeTrips}
          </Text>
          <Text fontSize="11px" color="#92400E" mt={1}>
            Currently on road
          </Text>
        </Box>

        <Box bg="white" p={4} borderRadius="12px" boxShadow="sm" border="1px solid #E2E8F0">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="12px" fontWeight="600" color="#64748B">
              Driver Earnings
            </Text>
            <FiDollarSign color="#16A34A" />
          </Flex>
          <Text fontSize="22px" fontWeight="800" color="#0F172A">
            ₹{(stats.totalDriverEarnings || 0).toLocaleString('en-IN')}
          </Text>
          <Text fontSize="11px" color="#16A34A" mt={1}>
            From Delivery Charges
          </Text>
        </Box>
      </SimpleGrid>

      {/* Connected Vendor Information Card */}
      <Box bg="#F8FAFC" p={4} borderRadius="14px" border="1px solid #E2E8F0" mb={6}>
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Box>
            <Flex align="center" gap={2} mb={1}>
              <FiHome color="#E65100" />
              <Text fontWeight="800" fontSize="15px" color="#0F172A">
                Assigned Store / Bhattha: {vendor?.businessName || driver.vendorName || 'Independent Fleet'}
              </Text>
            </Flex>
            <Text fontSize="13px" color="#64748B">
              Owner: {vendor?.ownerName || 'N/A'} • Contact: {vendor?.contactNumber || 'N/A'} • Location: {vendor?.fullShopAddress || driver.city || 'Lucknow'}
            </Text>
          </Box>
          <Badge colorScheme="orange" fontSize="13px" px={3} py={1} borderRadius="8px">
            Operating in {driver.city || 'Lucknow, UP'}
          </Badge>
        </Flex>
      </Box>

      {/* Assigned Orders Table */}
      <Box bg="white" borderRadius="16px" boxShadow="sm" border="1px solid #E2E8F0" p={5}>
        <Text fontSize="16px" fontWeight="800" color="#0F172A" mb={4}>
          Order Delivery Trips ({assignedOrders.length})
        </Text>

        {assignedOrders.length === 0 ? (
          <Text p={6} textAlign="center" color="#94A3B8">
            No delivery trips assigned to this driver yet.
          </Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="#F8FAFC">
                <Tr>
                  <Th>Order ID</Th>
                  <Th>Customer Name & Phone</Th>
                  <Th>Site Delivery Address</Th>
                  <Th>Items Carried</Th>
                  <Th>Order Value</Th>
                  <Th>Driver Trip Fee</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {assignedOrders.map((o) => (
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
                    <Td maxW="200px" isTruncated fontSize="12px">
                      {o.siteAddress || 'Site Delivery'}
                    </Td>
                    <Td maxW="180px" isTruncated fontSize="12px">
                      {o.items}
                    </Td>
                    <Td fontWeight="700">₹{(o.totalAmount || 0).toLocaleString('en-IN')}</Td>
                    <Td fontWeight="700" color="#16A34A">
                      ₹{(o.deliveryCharge || 450).toLocaleString('en-IN')}
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
                    <Td fontSize="11px" color="#64748B">
                      {new Date(o.createdAt).toLocaleDateString('en-IN')}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
}

