import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    const snapshot = await adminDb.collection('tasks').get();
    const tasks = snapshot.docs.map(doc => doc.data());
    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const taskRef = adminDb.collection('tasks').doc();
    const newTask = {
      id: taskRef.id,
      ...data,
      status: 'pending',
      createdAt: Date.now(),
    };
    await taskRef.set(newTask);
    return NextResponse.json({ success: true, task: newTask });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
