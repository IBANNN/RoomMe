const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'roomme.db');
const db = new DatabaseSync(dbPath);
const h = (pw) => bcrypt.hashSync(pw, 10);
const now = new Date().toISOString().split('T')[0];

const users = [
  ['u8', 'Daniel Villanueva', 'daniel.v@university.edu', '+63 924 123 4567', h('password123'), 'tenant', 'DV', 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=200&h=200&fit=crop&crop=face&q=80', 'De La Salle University', '2nd Year', {sleepSchedule:'Early Bird',cleanliness:'Moderate',studyHabits:'Café Studier',noiseTolerance:'Moderate',genderPreference:'Any'}],
  ['u9', 'Chloe Mendez', 'chloe.m@university.edu', '+63 925 234 5678', h('password123'), 'tenant', 'CM', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face&q=80', 'Ateneo de Manila University', '3rd Year', {sleepSchedule:'Night Owl',cleanliness:'Very Tidy',studyHabits:'Library Studier',noiseTolerance:'Quiet',genderPreference:'Female'}],
  ['u10', 'Elijah Cruz', 'elijah.c@university.edu', '+63 926 345 6789', h('password123'), 'tenant', 'EC', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=face&q=80', 'University of the Philippines', '1st Year', {sleepSchedule:'Late Riser',cleanliness:'Messy',studyHabits:'Room Studier',noiseTolerance:'High',genderPreference:'Male'}],
  ['u11', 'Isabella Santos', 'isa.s@university.edu', '+63 927 456 7890', h('password123'), 'tenant', 'IS', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face&q=80', 'University of Santo Tomas', '4th Year', {sleepSchedule:'Early Bird',cleanliness:'Very Tidy',studyHabits:'Room Studier',noiseTolerance:'Quiet',genderPreference:'Female'}],
  ['u12', 'Leo Reyes', 'leo.r@university.edu', '+63 928 567 8901', h('password123'), 'tenant', 'LR', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face&q=80', 'De La Salle University', '3rd Year', {sleepSchedule:'Night Owl',cleanliness:'Moderate',studyHabits:'Café Studier',noiseTolerance:'High',genderPreference:'Male'}],
  ['u13', 'Mia Torres', 'mia.t@university.edu', '+63 929 678 9012', h('password123'), 'tenant', 'MT', 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=200&h=200&fit=crop&crop=face&q=80', 'Ateneo de Manila University', '2nd Year', {sleepSchedule:'Early Bird',cleanliness:'Moderate',studyHabits:'Library Studier',noiseTolerance:'Moderate',genderPreference:'Any'}],
  ['u14', 'Lucas Bautista', 'lucas.b@university.edu', '+63 930 789 0123', h('password123'), 'tenant', 'LB', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face&q=80', 'University of the Philippines', 'Master\'s Student', {sleepSchedule:'Night Owl',cleanliness:'Very Tidy',studyHabits:'Room Studier',noiseTolerance:'Quiet',genderPreference:'Male'}]
];

const stmt = db.prepare('INSERT OR IGNORE INTO users (id,fullName,email,phone,passwordHash,role,avatar,photo,university,yearLevel,lifestyle,verified,emailVerified,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,1,1,?)');

users.forEach(u => {
  stmt.run(u[0], u[1], u[2], u[3], u[4], u[5], u[6], u[7], u[8], u[9], JSON.stringify(u[10]), now);
});

console.log('Successfully inserted more dummy tenants for roommate matching!');
