import { NextResponse } from 'next/server';
import { askGemini } from '@/lib/gemini';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const { incidentType, location, severity, incidentId } = await request.json();
    
    const prompt = `You are an emergency coordinator AI for a hotel. An emergency has been declared.
Type: ${incidentType}, Location: ${location}, Severity: ${severity}
Generate exactly 10 tasks as a JSON array. Each task object must have ONLY these keys:
title (string, max 8 words), assignedRole (one of: security/medical/management/admin), priority (critical/high/medium), estimatedMinutes (number 1-30).
Return ONLY the raw JSON array. No markdown. No explanation. No backticks. Start with [ and end with ].`;

    const responseText = await askGemini(prompt);
    let tasks = [];
    
    try {
      const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      tasks = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("Failed to parse Gemini tasks, using fallback", parseError);
      tasks = [
        { title: `Investigate ${location}`, assignedRole: 'security', priority: 'critical', estimatedMinutes: 5 },
        { title: `Prepare medical kits`, assignedRole: 'medical', priority: 'high', estimatedMinutes: 10 },
        { title: `Notify local authorities`, assignedRole: 'management', priority: 'critical', estimatedMinutes: 5 },
        { title: `Evacuate immediate area`, assignedRole: 'security', priority: 'critical', estimatedMinutes: 15 },
        { title: `Setup triage station`, assignedRole: 'medical', priority: 'high', estimatedMinutes: 15 },
        { title: `Coordinate with fire dept`, assignedRole: 'management', priority: 'critical', estimatedMinutes: 10 },
        { title: `Check all rooms near ${location}`, assignedRole: 'security', priority: 'high', estimatedMinutes: 20 },
        { title: `Standby for casualties`, assignedRole: 'medical', priority: 'high', estimatedMinutes: 30 },
        { title: `Brief executive team`, assignedRole: 'admin', priority: 'medium', estimatedMinutes: 10 },
        { title: `Secure perimeter`, assignedRole: 'security', priority: 'high', estimatedMinutes: 15 },
      ];
    }

    // Write all tasks to Firestore
    const batch = adminDb().batch();
    tasks.forEach((t: any) => {
      const taskRef = adminDb().collection('tasks').doc();
      batch.set(taskRef, {
        id: taskRef.id,
        incidentId,
        ...t,
        status: 'pending',
        createdAt: Date.now()
      });
    });
    
    await batch.commit();

    return NextResponse.json({ success: true, count: tasks.length });
  } catch (error: any) {
    console.error("Tasks API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
