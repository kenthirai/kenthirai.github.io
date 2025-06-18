// File: app/api/analyze-image/route.ts

import { NextResponse } from 'next/server';

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return new Response('Image data is required.', { status: 400 });
    }
    
    // --- PERUBAHAN DI SINI: Membaca API Key dari Environment Variable ---
    // Pastikan nama variabel 'POLLINATIONS_API_KEY' sesuai dengan yang Anda atur di Vercel.
    // Jika Anda menamakannya 'OPENAI_API_KEY' di Vercel, ganti di sini juga.
    const apiKey = process.env.POLLINATIONS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: 'API key is not configured on the server. Please set POLLINATIONS_API_KEY.' },
        { status: 500 }
      );
    }
    // --- AKHIR PERUBAHAN ---

    const payload = {
      model: 'openai',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and create a detailed, artistic prompt that could be used to generate a similar image. Focus on: main subject, environment, composition, art style, colors, lighting, mood, and any specific artistic techniques. Make it suitable for an AI image generator.',
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      stream: true,
    };

    // Panggil API Pollinations menggunakan metode POST dengan menyertakan Authorization
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST', // <-- Kembali menggunakan POST
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // <-- Menambahkan Kunci API di sini
      },
      body: JSON.stringify(payload), // <-- Mengirim data di body
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Pollinations API Error: ${response.status} - ${errorText}`);
        return new Response(`Failed to analyze image. Status: ${response.status}. Message: ${errorText}`, { status: response.status });
    }
    
    if (!response.body) {
        return new Response('The external API returned an empty response body.', { status: 502 });
    }

    const stream = iteratorToStream(response.body.getReader());

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }
    });

  } catch (error) {
    console.error('Analyze-image internal error:', error);
    return new Response('An internal server error occurred.', { status: 500 });
  }
}
