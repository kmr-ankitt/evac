import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
  try {
    const incidentData = await request.json();
    
    // Fetch all staff to get FCM tokens
    const staffSnapshot = await adminDb().collection('staff').get();
    const tokens: string[] = [];
    
    staffSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, message: "No FCM tokens found.", sent: 0, failed: 0 });
    }

    const payload = {
      notification: {
        title: "🚨 EMERGENCY ALERT",
        body: `${incidentData.type} at ${incidentData.location} — Severity: ${incidentData.severity}`,
      },
      data: {
        incidentId: incidentData.id,
        type: incidentData.type,
      }
    };

    const messaging = admin.messaging();
    const response = await messaging.sendMulticast({
      tokens,
      ...payload
    });

    return NextResponse.json({ 
      success: true, 
      sent: response.successCount, 
      failed: response.failureCount 
    });
  } catch (error: any) {
    console.error("Alert API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
