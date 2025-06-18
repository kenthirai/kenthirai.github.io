import { NextResponse } from 'next/server';

// Helper untuk mengubah stream menjadi format yang bisa dikirim oleh Next.js
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

// --- PASTIKAN FUNGSI INI BERNAMA 'POST' DALAM HURUF BESAR ---
export async function POST(req: Request) {
  try {
    const { image } = await req.json(); // Menerima gambar dalam format base64

    if (!image) {
      return new Response('Image data is required.', { status: 400 });
    }
    
    const apiToken = process.env.POLLINATIONS_TEXT_TOKEN;
    if (!apiToken) {
        return new Response('API token is not configured on the server.', { status: 500 });
    }

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
                url: image, // `image` adalah data URL base64
              },
            },
          ],
        },
      ],
      stream: true,
    };

    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST', // Metode ke API eksternal adalah POST
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Pollinations API Error: ${errorText}`);
        return new Response(`Failed to analyze image from external API: ${errorText}`, { status: response.status });
    }
    
    const stream = iteratorToStream(response.body!.getReader());

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' }
    });

  } catch (error) {
    console.error('Analyze-image internal error:', error);
    return new Response('An internal server error occurred.', { status: 500 });
  }
}
