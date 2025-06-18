// File: app/api/analyze-image/route.ts

import { NextResponse } from 'next/server';

// Helper untuk mengubah stream menjadi format yang bisa dikirim oleh Next.js
// Fungsi ini tidak diubah dan sudah benar.
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

    // Payload ini meniru struktur yang ada di ruangriung.js untuk vision model
    // Strukturnya sudah benar.
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

    // --- PERUBAHAN UTAMA DI BAWAH INI ---

    // 1. Ubah payload menjadi string JSON, lalu encode untuk URL
    const payloadString = JSON.stringify(payload);
    const encodedPayload = encodeURIComponent(payloadString);

    // 2. Buat URL lengkap dengan payload yang sudah di-encode.
    // Kita asumsikan API menerima payload sebagai bagian dari path, mirip dengan generate-audio.
    // Atau bisa juga sebagai query parameter, misalnya ?q=... atau ?data=...
    // Pola ini (`/openai/${encodedPayload}`) lebih konsisten dengan endpoint lain yang Anda gunakan.
    const fullUrl = `https://text.pollinations.ai/openai/${encodedPayload}`;


    // 3. Panggil API Pollinations menggunakan metode GET, bukan POST.
    const response = await fetch(fullUrl, {
      method: 'GET', // <-- Mengubah metode menjadi GET
      headers: {
        'Accept': 'text/event-stream', // Memberitahu server kita mengharapkan stream
        // Tidak perlu 'Content-Type' atau 'Authorization' untuk request GET ini
      },
    });

    // --- AKHIR PERUBAHAN ---


    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Pollinations API Error: ${response.status} - ${errorText}`);
        // Sertakan status dari response upstream untuk debugging yang lebih baik
        return new Response(`Failed to analyze image from external API. Status: ${response.status}`, { status: response.status });
    }
    
    // Pastikan body response ada sebelum mencoba membuat stream
    if (!response.body) {
        return new Response('The external API returned an empty response body.', { status: 502 }); // 502 Bad Gateway
    }

    const stream = iteratorToStream(response.body.getReader());

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    });

  } catch (error) {
    console.error('Analyze-image internal error:', error);
    return new Response('An internal server error occurred.', { status: 500 });
  }
}
