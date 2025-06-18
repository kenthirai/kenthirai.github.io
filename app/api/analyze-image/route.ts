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

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return new Response('Image data is required.', { status: 400 });
    }

    // Payload ini meniru struktur yang ada di ruangriung.js untuk vision model
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

    // Panggil API Pollinations TANPA Authorization header
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization' header dihapus dari sini
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Pollinations API Error: ${response.status} - ${errorText}`);
        return new Response(`Failed to analyze image from external API. Status: ${response.status}`, { status: response.status });
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
