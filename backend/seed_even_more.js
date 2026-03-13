const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'roomme.db');
const db = new DatabaseSync(dbPath);
const h = (pw) => bcrypt.hashSync(pw, 10);
const now = new Date().toISOString().split('T')[0];

console.log('Adding more landlords and tenants...');

const newUsers = [
  // New Landlords
  ['u_ll_2', 'Maria Garcia', 'maria@landlord.com', '+63 999 111 2222', h('password123'), 'landlord', 'MG', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop', null, null, null, 1, 1, now],
  ['u_ll_3', 'Richard Lee', 'richard@landlord.com', '+63 999 333 4444', h('password123'), 'landlord', 'RL', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop', null, null, null, 1, 1, now],
  // New Tenants
  ['u_t_20', 'Jessica Alba', 'jessica@student.com', '+63 999 555 6666', h('password123'), 'tenant', 'JA', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', 'UP Diliman', '3rd Year', JSON.stringify({sleepSchedule:'Early Bird',cleanliness:'Very Tidy',studyHabits:'Library Studier',noiseTolerance:'Quiet',genderPreference:'Female'}), 1, 1, now],
  ['u_t_21', 'Kevin Hart', 'kevin@student.com', '+63 999 777 8888', h('password123'), 'tenant', 'KH', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', 'Ateneo de Manila', '2nd Year', JSON.stringify({sleepSchedule:'Night Owl',cleanliness:'Moderate',studyHabits:'Room Studier',noiseTolerance:'Moderate',genderPreference:'Male'}), 1, 1, now]
];

const insertUser = db.prepare('INSERT OR IGNORE INTO users (id,fullName,email,phone,passwordHash,role,avatar,photo,university,yearLevel,lifestyle,verified,emailVerified,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
newUsers.forEach(u => insertUser.run(...u));

console.log('Adding more properties...');

const newProps = [
  ['p_mg_1', 'Cozy Studio in Katipunan', '123 Katipunan Ave, Quezon City', 'Quezon City', 15000, 2, 2, 'Studio', 'A beautiful cozy studio right across Ateneo.', JSON.stringify(['WiFi', 'Air Conditioning', 'Kitchen']), JSON.stringify(['No Smoking', 'No Pets']), JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80']), 'u_ll_2', 4.8, 12, 1, 'Any', '5 mins walk', 1, now],
  ['p_rl_1', 'Spacious 2BR Near UP', '456 Maginhawa St, Quezon City', 'Quezon City', 22000, 4, 4, '2 Bedroom', 'Large 2 bedroom apartment perfect for sharing.', JSON.stringify(['WiFi', 'Kitchen', 'Laundry']), JSON.stringify(['No loud music after 10PM']), JSON.stringify(['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'https://images.unsplash.com/photo-1600607687989-1382b6b0632b?w=800&q=80']), 'u_ll_3', 4.9, 8, 1, 'Any', '10 mins walk', 1, now]
];

const insertProp = db.prepare('INSERT OR IGNORE INTO properties (id,title,address,location,price,capacity,availableSlots,type,description,amenities,rules,photos,landlordId,rating,reviews,verified,genderPreference,distanceFromUni,available,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
newProps.forEach(p => insertProp.run(...p));

console.log('Done.');
