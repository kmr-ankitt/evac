import { NextResponse } from 'next/server';
import { askGemini } from '@/lib/gemini';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const { incidentId } = await request.json();
    
    // Fetch Data
    const incidentDoc = await adminDb().collection('incidents').doc(incidentId).get();
    if (!incidentDoc.exists) throw new Error("Incident not found");
    const incidentData = incidentDoc.data();

    const tasksSnapshot = await adminDb().collection('tasks').where('incidentId', '==', incidentId).get();
    const tasksData = tasksSnapshot.docs.map(d => d.data());

    const logsSnapshot = await adminDb().collection('logs').where('incidentId', '==', incidentId).get();
    const logsData = logsSnapshot.docs.map(d => d.data());

    const prompt = `Generate a formal emergency incident report. Write in plain paragraphs (no markdown, no bullet symbols, no headers with #). Use these section titles in CAPS followed by a colon: EXECUTIVE SUMMARY:, TIMELINE:, ACTIONS BY ROLE:, RESOLUTION:, RECOMMENDATIONS:
Data: Incident=${JSON.stringify(incidentData)}, Tasks=${JSON.stringify(tasksData)}, Logs=${JSON.stringify(logsData)}`;

    const reportText = await askGemini(prompt);

    return NextResponse.json({ report: reportText });
  } catch (error: any) {
    console.error("Report API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
