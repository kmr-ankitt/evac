import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Stub for creating an alert
    const incidentRef = adminDb.collection('incidents').doc();
    const newIncident = {
      id: incidentRef.id,
      ...data,
      status: 'active',
      createdAt: Date.now(),
    };
    
    await incidentRef.set(newIncident);
    
    return NextResponse.json({ success: true, incident: newIncident });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
