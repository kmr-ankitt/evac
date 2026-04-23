import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { incidentDetails } = await request.json();
    const model = getGeminiModel();
    
    // Stub: generate triage analysis
    const prompt = `Analyze this incident: ${incidentDetails}. Suggest severity and immediate actions.`;
    const result = await model.generateContent(prompt);
    
    return NextResponse.json({ triage: result.response.text() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
