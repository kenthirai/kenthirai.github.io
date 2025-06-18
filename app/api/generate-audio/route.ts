import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response('Invalid "text" in request body.', { status: 400 });
    }

    // Meng-encode teks agar aman untuk dimasukkan ke dalam URL
    const encodedText = encodeURIComponent(text);

    // Mengambil struktur URL dan parameter dari referensi tts.js yang berfungsi
    const params = new URLSearchParams({
      model: "openai-audio",
      voice: "alloy", // Anda bisa membuat ini dinamis nanti
    });

    const fullUrl = `https://text.pollinations.ai/${encodedText}?${params.toString()}`;

    // Memanggil API Pollinations dengan metode GET yang benar
    const response = await fetch(fullUrl, {
      method: 'GET', // Menggunakan metode GET
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pollinations API Error: ${errorText}`);
      return new Response(`Failed to generate audio from external API: ${errorText}`, { status: response.status });
    }

    // Memastikan respons adalah audio
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('audio/mpeg')) {
        const errorText = await response.text();
        console.error(`Unexpected content type from Pollinations API: ${contentType}`, errorText);
        return new Response('The external API did not return valid audio content.', { status: 502 }); // 502 Bad Gateway
    }

    // Mengirimkan data audio (blob) langsung kembali ke frontend
    const audioBlob = await response.blob();
    return new Response(audioBlob, {
      headers: { 'Content-Type': 'audio/mpeg' }
    });

  } catch (error) {
    console.error('Generate-audio internal error:', error);
    return new Response('An internal server error occurred.', { status: 500 });
  }
}
