import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Ambil data (prompt, width, height, dll.) dari permintaan frontend
    const body = await req.json();
    const { prompt, width, height, seed, negative_prompt } = body;

    // 2. Ambil token rahasia dari environment variable yang kita set di Vercel
    const apiToken = process.env.GPTIMAGE_API_TOKEN;

    if (!apiToken) {
      // Jika token tidak ditemukan di server, kirim error
      return NextResponse.json(
        { error: 'API token is not configured on the server.' },
        { status: 500 }
      );
    }
    
    // 3. Bangun URL untuk API Pollinations
    // Menggunakan endpoint gambar, bukan teks
    const endpoint = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
    
    // Tambahkan parameter lain ke URL
    const params = new URLSearchParams({
      width: width.toString(),
      height: height.toString(),
      seed: seed.toString(),
      nologo: 'true',
      model: 'gptimage', // Menggunakan model baru
    });

    if (negative_prompt) {
      params.append('negative_prompt', negative_prompt);
    }

    const finalUrl = `${endpoint}?${params.toString()}`;

    // 4. Lakukan panggilan ke API Pollinations dari backend
    // Di sini kita menambahkan header Authorization yang aman
    const response = await fetch(finalUrl, {
      headers: {
        'Authorization': `Bearer ${apiToken}`
      }
    });

    if (!response.ok) {
        // Jika gagal, teruskan pesan error dari API
        const errorBody = await response.text();
        return NextResponse.json(
            { error: `API request failed: ${response.statusText}`, details: errorBody },
            { status: response.status }
        );
    }

    // 5. Kirim kembali URL gambar yang sudah jadi ke frontend
    // Kita tidak mengirim gambar, hanya URL-nya. Browser akan menampilkannya.
    return NextResponse.json({ imageUrl: finalUrl });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}