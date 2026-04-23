import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

const SEED_USERS = [
  { email: 'admin@hotel.com', password: 'Admin123', role: 'admin', name: 'Admin User' },
  { email: 'security@hotel.com', password: 'Security123', role: 'security', name: 'Security Officer' },
  { email: 'medical@hotel.com', password: 'Medical123', role: 'medical', name: 'Medical Staff' },
  { email: 'mgmt@hotel.com', password: 'Mgmt123', role: 'management', name: 'Manager' },
];

export async function GET() {
  try {
    const results = [];
    
    for (const user of SEED_USERS) {
      try {
        let userRecord;
        try {
          userRecord = await adminAuth.getUserByEmail(user.email);
        } catch (error: any) {
          if (error.code === 'auth/user-not-found') {
            userRecord = await adminAuth.createUser({
              email: user.email,
              password: user.password,
              displayName: user.name,
            });
            results.push(`Created user: ${user.email}`);
          } else {
            throw error;
          }
        }

        if (userRecord) {
          await adminDb.collection('staff').doc(userRecord.uid).set({
            id: userRecord.uid,
            name: user.name,
            role: user.role,
            status: 'available',
            lastSeen: Date.now()
          }, { merge: true });
          results.push(`Set role ${user.role} for ${user.email}`);
        }
      } catch (err: any) {
        results.push(`Error processing ${user.email}: ${err.message}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
