// File: app/api/analyze-image/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Dapatkan data gambar (base64) dari body permintaan frontend.
    const { image } = await req.json();

    if (!image) {
      return new Response('Data gambar diperlukan.', { status: 400 });
    }

    // 2. Buat payload JSON yang sama persis dengan contoh Python Anda.
    const payload = {
        model: "openai", // Model yang mendukung input gambar
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Analyze this image and create a detailed, artistic prompt that could be used to generate a similar image. Focus on: main subject, environment, composition, art style, colors, lighting, mood, and any specific artistic techniques. Make it suitable for an AI image generator."
                    },
                    {
                        type: "image_url",
                        image_url: {
                           "url": image // 'image' dari frontend sudah dalam format "data:image/...;base64,..."
                        }
                    }
                ]
            }
        ],
        max_tokens: 500, // Batasi panjang respons agar tidak terlalu besar
        stream: false // PENTING: Minta respons JSON, bukan stream
    };

    // 3. Kirim permintaan POST ke endpoint yang benar dengan header yang benar.
    const response = await fetch("https://text.pollinations.ai/openai", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    // 4. Periksa apakah permintaan itu sendiri berhasil.
    if (!response.ok) {
      // Jika gagal, berikan pesan error yang informatif.
      const errorText = await response.text();
      console.error(`Pollinations API Error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { message: `Gagal menganalisis gambar. Status: ${response.status}. Pesan: ${errorText}` },
        { status: response.status }
      );
    }

    // 5. Baca respons sebagai JSON (bukan stream) dan kirim kembali ke frontend.
    const result = await response.json();
    
    // Kirim seluruh objek hasil kembali ke frontend
    return NextResponse.json(result);

  } catch (error) {
    console.error('Analyze-image internal error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan internal pada server.' },
      { status: 500 }
    );
  }
}
