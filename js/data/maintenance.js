// Mock Maintenance Data
var MAINTENANCE_DATA = [
  {
    id: 'mt1',
    tenantId: 'u1',
    propertyId: 'p1',
    category: 'Plumbing',
    title: 'Leaking faucet in bathroom',
    description: 'The bathroom faucet has been dripping continuously for the past two days. It\'s getting worse and wasting water.',
    priority: 'Medium',
    status: 'In Progress',
    photos: [],
    createdAt: '2026-03-05T08:30:00',
    updatedAt: '2026-03-07T14:00:00',
    timeline: [
      { status: 'Submitted', date: '2026-03-05T08:30:00', note: 'Request submitted by tenant' },
      { status: 'Acknowledged', date: '2026-03-05T16:00:00', note: 'Landlord acknowledged the request' },
      { status: 'In Progress', date: '2026-03-07T14:00:00', note: 'Plumber scheduled for March 9' }
    ]
  },
  {
    id: 'mt2',
    tenantId: 'u1',
    propertyId: 'p1',
    category: 'Electrical',
    title: 'Broken outlet in bedroom',
    description: 'One of the electrical outlets near my study desk stopped working. I can\'t plug in my laptop charger.',
    priority: 'High',
    status: 'Pending',
    photos: [],
    createdAt: '2026-03-09T10:00:00',
    updatedAt: '2026-03-09T10:00:00',
    timeline: [
      { status: 'Submitted', date: '2026-03-09T10:00:00', note: 'Request submitted by tenant' }
    ]
  },
  {
    id: 'mt3',
    tenantId: 'u2',
    propertyId: 'p5',
    category: 'Furniture',
    title: 'Broken wardrobe handle',
    description: 'The wardrobe door handle came off. Need a replacement.',
    priority: 'Low',
    status: 'Completed',
    photos: [],
    createdAt: '2026-02-20T11:00:00',
    updatedAt: '2026-02-25T09:00:00',
    timeline: [
      { status: 'Submitted', date: '2026-02-20T11:00:00', note: 'Request submitted by tenant' },
      { status: 'Acknowledged', date: '2026-02-20T15:00:00', note: 'Landlord acknowledged' },
      { status: 'In Progress', date: '2026-02-22T10:00:00', note: 'Replacement ordered' },
      { status: 'Completed', date: '2026-02-25T09:00:00', note: 'New handle installed' }
    ]
  },
  {
    id: 'mt4',
    tenantId: 'u6',
    propertyId: 'p2',
    category: 'Internet',
    title: 'WiFi intermittent connection',
    description: 'The WiFi keeps disconnecting every few minutes. This has been happening for a week and it\'s affecting my studies.',
    priority: 'High',
    status: 'In Progress',
    photos: [],
    createdAt: '2026-03-08T09:00:00',
    updatedAt: '2026-03-10T11:00:00',
    timeline: [
      { status: 'Submitted', date: '2026-03-08T09:00:00', note: 'Request submitted by tenant' },
      { status: 'Acknowledged', date: '2026-03-08T10:30:00', note: 'ISP contacted for diagnosis' },
      { status: 'In Progress', date: '2026-03-10T11:00:00', note: 'ISP technician visit scheduled for March 12' }
    ]
  },
  {
    id: 'mt5',
    tenantId: 'u7',
    propertyId: 'p4',
    category: 'Plumbing',
    title: 'Clogged shared bathroom drain',
    description: 'The drain in the shared bathroom is clogged. Water pools up during showers.',
    priority: 'High',
    status: 'Pending',
    photos: [],
    createdAt: '2026-03-11T06:00:00',
    updatedAt: '2026-03-11T06:00:00',
    timeline: [
      { status: 'Submitted', date: '2026-03-11T06:00:00', note: 'Request submitted by tenant' }
    ]
  }
];
