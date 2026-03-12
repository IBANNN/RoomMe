// Mock Notifications Data
const NOTIFICATIONS_DATA = [
  {
    id: 'n1',
    userId: 'u1',
    type: 'application',
    title: 'Application Submitted',
    message: 'Your application for "Premium 1BR Condo near Ateneo" has been submitted successfully.',
    icon: '📋',
    iconBg: 'rgba(99, 102, 241, 0.1)',
    link: '/applications',
    read: false,
    timestamp: '2026-03-08T10:00:00'
  },
  {
    id: 'n2',
    userId: 'u1',
    type: 'maintenance',
    title: 'Maintenance Update',
    message: 'Your request "Leaking faucet in bathroom" is now In Progress. A plumber has been scheduled.',
    icon: '🔧',
    iconBg: 'rgba(56, 189, 248, 0.1)',
    link: '/maintenance',
    read: false,
    timestamp: '2026-03-07T14:00:00'
  },
  {
    id: 'n3',
    userId: 'u1',
    type: 'payment',
    title: 'Payment Reminder',
    message: 'Your rent of ₱8,500 for March 2026 is due on March 15.',
    icon: '💳',
    iconBg: 'rgba(245, 158, 11, 0.1)',
    link: '/payments',
    read: true,
    timestamp: '2026-03-05T08:00:00'
  },
  {
    id: 'n4',
    userId: 'u1',
    type: 'message',
    title: 'New Message',
    message: 'Angela Cruz sent you a message about the property viewing.',
    icon: '💬',
    iconBg: 'rgba(0, 212, 170, 0.1)',
    link: '/messages',
    read: true,
    timestamp: '2026-03-10T10:42:00'
  },
  {
    id: 'n5',
    userId: 'u3',
    type: 'application',
    title: 'New Application',
    message: 'Maria Santos has applied for "Premium 1BR Condo near Ateneo".',
    icon: '📋',
    iconBg: 'rgba(99, 102, 241, 0.1)',
    link: '/applications',
    read: false,
    timestamp: '2026-03-08T10:01:00'
  },
  {
    id: 'n6',
    userId: 'u3',
    type: 'maintenance',
    title: 'New Maintenance Request',
    message: 'Maria Santos submitted a maintenance request for broken outlet.',
    icon: '🔧',
    iconBg: 'rgba(255, 107, 107, 0.1)',
    link: '/maintenance',
    read: false,
    timestamp: '2026-03-09T10:01:00'
  },
  {
    id: 'n7',
    userId: 'u3',
    type: 'payment',
    title: 'Payment Received',
    message: 'Sofia Garcia paid ₱5,500 for March 2026 rent.',
    icon: '✅',
    iconBg: 'rgba(0, 212, 170, 0.1)',
    link: '/payments',
    read: true,
    timestamp: '2026-03-10T09:00:00'
  },
  {
    id: 'n8',
    userId: 'u5',
    type: 'verification',
    title: 'Verification Request',
    message: 'Roberto Tan has submitted identity documents for verification.',
    icon: '🛡️',
    iconBg: 'rgba(167, 139, 250, 0.1)',
    link: '/dashboard',
    read: false,
    timestamp: '2026-03-06T11:00:00'
  },
  {
    id: 'n9',
    userId: 'u5',
    type: 'listing',
    title: 'New Listing for Approval',
    message: 'Isabella Mendoza submitted "New Dormitory near PUP" for review.',
    icon: '🏠',
    iconBg: 'rgba(56, 189, 248, 0.1)',
    link: '/properties',
    read: false,
    timestamp: '2026-03-10T12:00:00'
  },
  {
    id: 'n10',
    userId: 'u1',
    type: 'payment',
    title: 'Payment Verified',
    message: 'Your payment for February 2026 has been approved by the admin.',
    icon: '✅',
    iconBg: 'rgba(0, 212, 170, 0.1)',
    link: '/payments',
    read: false,
    timestamp: '2026-03-11T11:00:00'
  }
];
