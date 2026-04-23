import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { incidentDetails } = await request.json();
    const model = getGeminiModel();
    
    // Stub: generate tasks
    const prompt = `Based on this incident: ${incidentDetails}, list 3 immediate tasks categorized by role (security, medical, management).`;
    const result = await model.generateContent(prompt);
    
    return NextResponse.json({ suggestedTasks: result.response.text() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
