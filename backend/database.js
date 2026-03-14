// Database — uses Node.js 22.5+ built-in sqlite (node:sqlite)
// No native compilation needed! Ships with Node.js.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'roomme.db');
const db = new DatabaseSync(dbPath);

// Enable WAL for better performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// ─── helpers to make API compatible with how routes use it ──────────────────
// node:sqlite's prepare().get() returns result directly but all() is not there,
// it uses .iterate() or just returns results. Let's verify the exact API.
// DatabaseSync.prepare() returns a StatementSync which has:
//   .all(...params)  → rows[]
//   .get(...params)  → row | undefined
//   .run(...params)  → { changes, lastInsertRowid }

// ─── Schema ─────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, fullName TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
    phone TEXT, passwordHash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'tenant',
    avatar TEXT, photo TEXT, university TEXT, yearLevel TEXT, lifestyle TEXT DEFAULT '{}',
    verified INTEGER DEFAULT 0, emailVerified INTEGER DEFAULT 0,
    verificationBadge INTEGER DEFAULT 0, idVerified INTEGER DEFAULT 0,
    otp TEXT, otpExpiry TEXT, createdAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, address TEXT NOT NULL,
    location TEXT NOT NULL, price REAL NOT NULL, capacity INTEGER DEFAULT 1,
    availableSlots INTEGER DEFAULT 1, type TEXT NOT NULL, description TEXT,
    amenities TEXT DEFAULT '[]', rules TEXT DEFAULT '[]', photos TEXT DEFAULT '[]',
    landlordId TEXT NOT NULL, rating REAL DEFAULT 0, reviews INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0, genderPreference TEXT DEFAULT 'Any',
    distanceFromUni TEXT, available INTEGER DEFAULT 1, certificate TEXT, createdAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, propertyId TEXT NOT NULL,
    landlordId TEXT NOT NULL, status TEXT DEFAULT 'Pending',
    message TEXT, submittedAt TEXT NOT NULL, updatedAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, propertyId TEXT NOT NULL,
    landlordId TEXT NOT NULL, amount REAL NOT NULL, month TEXT NOT NULL,
    dueDate TEXT, paidDate TEXT, status TEXT DEFAULT 'Pending',
    method TEXT, receiptNo TEXT, proofUrl TEXT, createdAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS maintenance (
    id TEXT PRIMARY KEY, tenantId TEXT NOT NULL, propertyId TEXT NOT NULL,
    category TEXT NOT NULL, title TEXT NOT NULL, description TEXT,
    priority TEXT DEFAULT 'Medium', status TEXT DEFAULT 'Pending',
    photos TEXT DEFAULT '[]', timeline TEXT DEFAULT '[]',
    createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY, user1Id TEXT NOT NULL, user2Id TEXT NOT NULL,
    lastMessage TEXT, lastAt TEXT, createdAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, conversationId TEXT NOT NULL, senderId TEXT NOT NULL,
    content TEXT, attachmentUrl TEXT, type TEXT DEFAULT 'text', sentAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, type TEXT, icon TEXT DEFAULT '🔔',
    iconBg TEXT DEFAULT 'rgba(0,212,170,0.1)', title TEXT NOT NULL, message TEXT,
    link TEXT DEFAULT '/dashboard', read INTEGER DEFAULT 0, timestamp TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, propertyId TEXT NOT NULL,
    createdAt TEXT NOT NULL, UNIQUE(userId, propertyId)
  );
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, type TEXT NOT NULL,
    fileUrl TEXT NOT NULL, fileName TEXT, uploadedAt TEXT NOT NULL
  );
`);

// ─── Seed Data ───────────────────────────────────────────────────────────────
function seed() {
  console.log('🌱 Checking seed data...');
  const h = (pw) => bcrypt.hashSync(pw, 10);
  const now = new Date().toISOString();

  try {
    db.exec('ALTER TABLE properties ADD COLUMN certificate TEXT;');
  } catch (e) {
    // Column likely already exists
  }

  db.exec('BEGIN;');
  try {
    const iU = db.prepare(`INSERT OR IGNORE INTO users (id,fullName,email,phone,passwordHash,role,avatar,photo,university,yearLevel,lifestyle,verified,emailVerified,verificationBadge,idVerified,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    iU.run('u1','Maria Santos','maria.santos@university.edu','+63 917 123 4567',h('password123'),'tenant','MS','https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face&q=80','University of the Philippines','3rd Year',JSON.stringify({sleepSchedule:'Early Bird',cleanliness:'Very Tidy',studyHabits:'Library Studier',noiseTolerance:'Quiet',genderPreference:'Female'}),1,1,1,0,'2025-09-15');
    iU.run('u2','James Reyes','james.reyes@university.edu','+63 918 234 5678',h('password123'),'tenant','JR','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face&q=80','Ateneo de Manila University','2nd Year',JSON.stringify({sleepSchedule:'Night Owl',cleanliness:'Moderate',studyHabits:'Room Studier',noiseTolerance:'Moderate',genderPreference:'Male'}),1,1,1,0,'2025-10-01');
    iU.run('u3','Angela Cruz','angela.cruz@email.com','+63 919 345 6789',h('password123'),'landlord','AC','https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face&q=80',null,null,'{}',1,1,1,1,'2025-08-20');
    iU.run('u4','Roberto Tan','roberto.tan@email.com','+63 920 456 7890',h('password123'),'landlord','RT','https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face&q=80',null,null,'{}',1,1,0,0,'2025-11-05');
    iU.run('u5','Admin User','admin@roomme.com','+63 921 567 8901',h('admin123'),'admin','AU','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face&q=80',null,null,'{}',1,1,1,0,'2025-01-01');
    iU.run('u6','Sofia Garcia','sofia.garcia@university.edu','+63 922 678 9012',h('password123'),'tenant','SG','https://images.unsplash.com/photo-1488426862026-3ee34c7e56cd?w=200&h=200&fit=crop&crop=face&q=80','De La Salle University','4th Year',JSON.stringify({sleepSchedule:'Early Bird',cleanliness:'Very Tidy',studyHabits:'Café Studier',noiseTolerance:'Quiet',genderPreference:'Female'}),1,1,1,0,'2025-09-30');
    iU.run('u7','Miguel Lopez','miguel.lopez@university.edu','+63 923 789 0123',h('password123'),'tenant','ML','https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&h=200&fit=crop&crop=face&q=80','University of Santo Tomas','1st Year',JSON.stringify({sleepSchedule:'Night Owl',cleanliness:'Moderate',studyHabits:'Room Studier',noiseTolerance:'High',genderPreference:'Male'}),0,0,0,0,'2025-12-01');
    iU.run('u8','Daniel Villanueva','daniel.v@university.edu','+63 924 123 4567',h('password123'),'tenant','DV','https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=200&h=200&fit=crop&crop=face&q=80','De La Salle University','2nd Year',JSON.stringify({sleepSchedule:'Early Bird',cleanliness:'Moderate',studyHabits:'Café Studier',noiseTolerance:'Moderate',genderPreference:'Any'}),1,1,0,0,'2025-12-05');
    iU.run('u9','Chloe Mendez','chloe.m@university.edu','+63 925 234 5678',h('password123'),'tenant','CM','https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face&q=80','Ateneo de Manila University','3rd Year',JSON.stringify({sleepSchedule:'Night Owl',cleanliness:'Very Tidy',studyHabits:'Library Studier',noiseTolerance:'Quiet',genderPreference:'Female'}),1,1,0,0,'2025-12-10');
    iU.run('u10','Elijah Cruz','elijah.c@university.edu','+63 926 345 6789',h('password123'),'tenant','EC','https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=face&q=80','University of the Philippines','1st Year',JSON.stringify({sleepSchedule:'Late Riser',cleanliness:'Messy',studyHabits:'Room Studier',noiseTolerance:'High',genderPreference:'Male'}),1,1,0,0,'2025-12-15');
    iU.run('u11','Isabella Santos','isa.s@university.edu','+63 927 456 7890',h('password123'),'tenant','IS','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face&q=80','University of Santo Tomas','4th Year',JSON.stringify({sleepSchedule:'Early Bird',cleanliness:'Very Tidy',studyHabits:'Room Studier',noiseTolerance:'Quiet',genderPreference:'Female'}),1,1,0,0,'2025-12-20');
    iU.run('u12','Leo Reyes','leo.r@university.edu','+63 928 567 8901',h('password123'),'tenant','LR','https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face&q=80','De La Salle University','3rd Year',JSON.stringify({sleepSchedule:'Night Owl',cleanliness:'Moderate',studyHabits:'Café Studier',noiseTolerance:'High',genderPreference:'Male'}),1,1,0,0,'2025-12-25');
    iU.run('u13','Mia Torres','mia.t@university.edu','+63 929 678 9012',h('password123'),'tenant','MT','https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=200&h=200&fit=crop&crop=face&q=80','Ateneo de Manila University','2nd Year',JSON.stringify({sleepSchedule:'Early Bird',cleanliness:'Moderate',studyHabits:'Library Studier',noiseTolerance:'Moderate',genderPreference:'Any'}),1,1,0,0,'2025-12-30');
    iU.run('u14','Lucas Bautista','lucas.b@university.edu','+63 930 789 0123',h('password123'),'tenant','LB','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face&q=80','University of the Philippines','Master\'s Student',JSON.stringify({sleepSchedule:'Night Owl',cleanliness:'Very Tidy',studyHabits:'Room Studier',noiseTolerance:'Quiet',genderPreference:'Male'}),1,1,0,0,'2026-01-05');
    iU.run('u15','Isabella Mendoza','isabella.m@email.com','+63 924 890 1234',h('password123'),'landlord','IM','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face&q=80',null,null,'{}',0,0,0,0,'2025-12-15');

    const iP = db.prepare(`INSERT OR IGNORE INTO properties (id,title,address,location,price,capacity,availableSlots,type,description,amenities,rules,photos,landlordId,rating,reviews,verified,genderPreference,distanceFromUni,available,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    iP.run('p1','Modern Studio near UP Campus','123 Katipunan Ave, Quezon City','Quezon City',8500,1,1,'Studio','A modern, fully-furnished studio apartment just a 5-minute walk from UP Campus.',JSON.stringify(['WiFi','Air Conditioning','Private Bathroom','Kitchen','Laundry','Study Desk']),JSON.stringify(['No smoking','No pets','Quiet hours after 10PM']),JSON.stringify(['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80']),'u3',4.8,24,1,'Any','0.3 km',1,now);
    iP.run('p2','Cozy Shared Room in Katipunan','456 C.P. Garcia Ave, Quezon City','Quezon City',5500,2,1,'Shared Room','A comfortable shared room in a well-maintained boarding house.',JSON.stringify(['WiFi','Shared Bathroom','Common Kitchen','Laundry','CCTV']),JSON.stringify(['No overnight visitors','Quiet hours after 11PM']),JSON.stringify(['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80','https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80','https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800&q=80']),'u3',4.5,18,1,'Female','0.8 km',1,now);
    iP.run('p3','Premium 1BR Condo near Ateneo','789 Aurora Blvd, Quezon City','Quezon City',15000,2,2,'1 Bedroom','Spacious 1-bedroom condo unit with balcony overlooking the skyline.',JSON.stringify(['WiFi','Air Conditioning','Balcony','Pool','Gym','24/7 Security']),JSON.stringify(['No pets over 5kg']),JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80']),'u3',4.9,32,1,'Any','1.2 km',1,now);
    iP.run('p4','Budget-Friendly Bedspace in Sampaloc','321 España Blvd, Manila','Manila',3500,4,2,'Bedspace','Affordable bedspace near UST.',JSON.stringify(['WiFi','Shared Bathroom','Individual Locker','Common Area']),JSON.stringify(['No cooking in rooms','Curfew at 11PM']),JSON.stringify(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80','https://images.unsplash.com/photo-1519974719765-e6559eac2575?w=800&q=80','https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80']),'u3',4.2,45,1,'Male','0.5 km',1,now);
    iP.run('p5','Spacious Room near DLSU','567 Taft Ave, Manila','Manila',7000,1,1,'Single Room','Well-ventilated single room near DLSU.',JSON.stringify(['WiFi','Study Desk','Wardrobe','Shared Kitchen']),JSON.stringify(['No loud music']),JSON.stringify(['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80','https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80']),'u4',4.6,15,0,'Any','0.4 km',1,now);
    iP.run('p6','Furnished Apartment in BGC','890 High Street, Taguig','Taguig',22000,2,1,'2 Bedroom','Luxurious furnished apartment in BGC.',JSON.stringify(['WiFi','Air Conditioning','2 Bathrooms','Washer/Dryer','Pool','Gym']),JSON.stringify(['No smoking']),JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80','https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80','https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80']),'u4',4.7,8,0,'Any','5.2 km',1,now);
    iP.run('p7','Charming Room in Heritage House','234 Gen. Luna St, Manila','Manila',6000,1,1,'Single Room','Restored heritage house in Intramuros.',JSON.stringify(['WiFi','Air Conditioning','Shared Bathroom','Garden']),JSON.stringify(['No alterations']),JSON.stringify(['https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80','https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80','https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80']),'u4',4.4,12,0,'Any','2.1 km',1,now);
    iP.run('p8','New Dormitory near PUP','456 Sta. Mesa, Manila','Manila',4000,4,3,'Bedspace','Newly constructed dormitory near PUP.',JSON.stringify(['WiFi','CCTV','24/7 Security','Shared Kitchen','Study Room']),JSON.stringify(['No pets']),JSON.stringify(['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80','https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=800&q=80','https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80']),'u15',4.0,5,0,'Any','0.2 km',1,now);
    iP.run('p9','Stylish Loft near Mapúa','789 Muralla St, Manila','Manila',12000,2,1,'Loft','Industrial loft-style unit.',JSON.stringify(['WiFi','Air Conditioning','Kitchen','Rooftop Access']),JSON.stringify(['No parties']),JSON.stringify(['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80','https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80','https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?w=800&q=80']),'u15',4.3,9,0,'Any','0.6 km',1,now);
    iP.run('p10','Sunny Apartment near Adamson','101 San Marcelino St, Manila','Manila',9000,2,2,'1 Bedroom','Bright 12th-floor apartment near Adamson.',JSON.stringify(['WiFi','Air Conditioning','Elevator','Kitchen']),JSON.stringify(['No subletting']),JSON.stringify(['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80','https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80','https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80']),'u3',4.5,14,1,'Any','0.3 km',1,now);
    iP.run('p11','Executive Suite in Makati','500 Ayala Ave, Makati','Makati',28000,2,1,'2 Bedroom','Premium executive suite in Makati CBD.',JSON.stringify(['WiFi','Smart Home','Pool','Gym','Spa','Concierge']),JSON.stringify(['Professional tenants preferred']),JSON.stringify(['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80','https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80']),'u4',4.9,6,0,'Any','8.5 km',1,now);
    iP.run('p12','Eco-Friendly Stay near FEU','200 Nicanor Reyes St, Manila','Manila',5000,2,1,'Shared Room','Eco-conscious shared living near FEU.',JSON.stringify(['WiFi','Rooftop Garden','Solar Power','Bike Parking']),JSON.stringify(['Practice waste segregation']),JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80','https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800&q=80','https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?w=800&q=80']),'u3',4.6,20,1,'Any','0.1 km',1,now);

    const iA = db.prepare('INSERT OR IGNORE INTO applications VALUES (?,?,?,?,?,?,?,?)');
    iA.run('app1','u1','p1','u3','Approved','Hi! I am a 3rd year UP student.',now,now);
    iA.run('app2','u2','p3','u3','Approved','Interested in the 1BR condo. I can move in next week.',now,now);
    iA.run('app3','u6','p2','u3','Rejected',"Hello! I'd like to apply.",now,now);
    iA.run('app4','u7','p4','u3','Pending','Need affordable bedspace near UST.',now,now);

    const iPay = db.prepare('INSERT OR IGNORE INTO payments VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
    // Existing payments for u1 (Maria)
    iPay.run('pay1','u1','p1','u3',8500,'January 2026','2026-01-05','2026-01-03','Paid','GCash','RCV-2026-001',null,now);
    iPay.run('pay2','u1','p1','u3',8500,'February 2026','2026-02-05','2026-02-01','Paid','Bank Transfer','RCV-2026-002',null,now);
    iPay.run('pay3','u1','p1','u3',8500,'March 2026','2026-03-05',null,'Pending',null,null,null,now);
    
    // New auto-generated move-in payments for u1 (Maria) - so Angela can see it in her dashboard
    iPay.run('pay7','u1','p1','u3',8500,'1st Month Advance','2026-01-01','2025-12-28','Paid','Bank Transfer','RCV-2025-901',null,now);
    iPay.run('pay8','u1','p1','u3',8500,'Security Deposit (Pt 1)','2026-01-01','2025-12-28','Paid','Bank Transfer','RCV-2025-902',null,now);
    iPay.run('pay9','u1','p1','u3',8500,'Security Deposit (Pt 2)','2026-01-01','2025-12-28','Paid','Bank Transfer','RCV-2025-903',null,now);
    
    // New auto-generated move-in payments for recently approved u2
    iPay.run('pay4','u2','p3','u3',15000,'1st Month Advance','2026-04-01','2026-03-25','Paid','GCash','RCV-2026-101',null,now);
    iPay.run('pay5','u2','p3','u3',15000,'Security Deposit (Pt 1)','2026-04-01','2026-03-25','Paid','GCash','RCV-2026-102',null,now);
    iPay.run('pay6','u2','p3','u3',15000,'Security Deposit (Pt 2)','2026-04-01','2026-03-25','Paid','GCash','RCV-2026-103',null,now);

    const iM = db.prepare('INSERT OR IGNORE INTO maintenance VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
    iM.run('m1','u1','p1','Plumbing','Leaking Faucet','Bathroom faucet dripping.','Medium','In Progress','[]',JSON.stringify([{action:'Submitted',by:'Maria Santos',date:'2025-12-20',note:'Initial report'}]),'2025-12-20T10:00:00Z','2025-12-20T10:00:00Z');
    iM.run('m2','u1','p1','Electrical','Flickering Lights','Ceiling lights flicker randomly.','High','Pending','[]',JSON.stringify([{action:'Submitted',by:'Maria Santos',date:'2026-01-10',note:'Started flickering'}]),'2026-01-10T09:00:00Z','2026-01-10T09:00:00Z');



    const iN = db.prepare('INSERT INTO notifications VALUES (?,?,?,?,?,?,?,?,?,?)');
    iN.run('n1','u1','payment','✅','rgba(0,212,170,0.1)','Payment Received','Your payment of ₱8,500 for January 2026 has been confirmed.','/payments',0,now);
    iN.run('n2','u1','application','📋','rgba(99,102,241,0.1)','Application Approved!','Your application for Modern Studio near UP Campus has been approved!','/applications',0,now);
    iN.run('n3','u2','application','📋','rgba(245,158,11,0.1)','Application Under Review','Your application is being reviewed.','/applications',0,now);

    db.prepare('INSERT OR IGNORE INTO favorites VALUES (?,?,?,?)').run('fav1','u1','p3',now);
    db.prepare('INSERT OR IGNORE INTO favorites VALUES (?,?,?,?)').run('fav2','u1','p6',now);

    db.exec('COMMIT;');
    console.log('✅ Database seeded successfully');
  } catch(e) {
    db.exec('ROLLBACK;');
    console.error('❌ Seed failed:', e.message);
  }
}

seed();

module.exports = db;
