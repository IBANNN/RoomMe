// Mock Messages Data
var MESSAGES_DATA = [
  {
    id: 'conv1',
    participants: ['u1', 'u3'],
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hi! I\'m interested in the Modern Studio near UP Campus. Is it still available?', timestamp: '2026-03-10T10:30:00', read: true },
      { id: 'm2', senderId: 'u3', text: 'Hello Maria! Yes, it\'s still available. Would you like to schedule a viewing?', timestamp: '2026-03-10T10:35:00', read: true },
      { id: 'm3', senderId: 'u1', text: 'That would be great! Are you available this Saturday morning?', timestamp: '2026-03-10T10:38:00', read: true },
      { id: 'm4', senderId: 'u3', text: 'Saturday at 10 AM works perfectly. I\'ll send you the exact unit number. Please bring a valid ID for building access.', timestamp: '2026-03-10T10:42:00', read: true },
      { id: 'm5', senderId: 'u1', text: 'Perfect, thank you! See you then! 😊', timestamp: '2026-03-10T10:45:00', read: false }
    ]
  },
  {
    id: 'conv2',
    participants: ['u1', 'u6'],
    messages: [
      { id: 'm6', senderId: 'u6', text: 'Hey Maria! I saw we got matched as potential roommates. Your profile looks great!', timestamp: '2026-03-09T14:00:00', read: true },
      { id: 'm7', senderId: 'u1', text: 'Hi Sofia! Yes, I noticed too! You study at DLSU right? That\'s cool!', timestamp: '2026-03-09T14:15:00', read: true },
      { id: 'm8', senderId: 'u6', text: 'Yes! I\'m looking for a place near Taft. Have you found any good listings?', timestamp: '2026-03-09T14:20:00', read: true },
      { id: 'm9', senderId: 'u1', text: 'I\'ve been eyeing a few places. Let me share some links with you later!', timestamp: '2026-03-09T14:25:00', read: false }
    ]
  },
  {
    id: 'conv3',
    participants: ['u2', 'u4'],
    messages: [
      { id: 'm10', senderId: 'u2', text: 'Good day! I submitted an application for your furnished apartment. Any update?', timestamp: '2026-03-08T09:00:00', read: true },
      { id: 'm11', senderId: 'u4', text: 'Hi James! I received your application. I\'ll review it and get back to you within 2 days.', timestamp: '2026-03-08T09:30:00', read: true },
      { id: 'm12', senderId: 'u2', text: 'Thank you so much! Looking forward to hearing from you.', timestamp: '2026-03-08T09:35:00', read: true }
    ]
  },
  {
    id: 'conv4',
    participants: ['u3', 'u5'],
    messages: [
      { id: 'm13', senderId: 'u5', text: 'Hi Angela. We\'ve approved your property listing verification. Your listings are now marked as verified.', timestamp: '2026-03-07T11:00:00', read: true },
      { id: 'm14', senderId: 'u3', text: 'Wonderful news! Thank you for the quick processing. I\'ve also submitted a new listing, could you review that as well?', timestamp: '2026-03-07T11:15:00', read: true },
      { id: 'm15', senderId: 'u5', text: 'Absolutely, I\'ll take a look at it today.', timestamp: '2026-03-07T11:20:00', read: true }
    ]
  }
];
