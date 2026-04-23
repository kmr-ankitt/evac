import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { incidentLogs } = await request.json();
    const model = getGeminiModel();
    
    // Stub: generate post-incident report
    const prompt = `Generate a post-incident summary based on these logs: ${JSON.stringify(incidentLogs)}`;
    const result = await model.generateContent(prompt);
    
    return NextResponse.json({ report: result.response.text() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
