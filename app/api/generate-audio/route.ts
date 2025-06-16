import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const apiToken = process.env.POLLINATIONS_TEXT_TOKEN;

    if (!apiToken) {
      return new Response('Audio API token is not configured on the server.', { status: 500 });
    }

    // Panggil API Pollinations dari backend dengan token yang aman
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify({
        text: text,
        voice: "alloy",
        model: "tts-1",
        format: "mp3",
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`Failed to generate audio: ${errorText}`, { status: response.status });
    }

    // Kirimkan data audio langsung kembali ke frontend
    const audioBlob = await response.blob();
    return new Response(audioBlob, {
      headers: { 'Content-Type': 'audio/mpeg' }
    });

  } catch (error) {
    console.error('Generate-audio error:', error);
    return new Response('An internal server error occurred.', { status: 500 });
  }
}