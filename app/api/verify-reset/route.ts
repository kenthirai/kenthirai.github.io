import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const secretPassword = process.env.RESET_PASSWORD;

    if (!secretPassword) {
      return NextResponse.json({ message: 'Reset password is not configured on the server.' }, { status: 500 });
    }

    if (password === secretPassword) {
      // Jika password cocok, kirim respons berhasil
      return NextResponse.json({ success: true, message: 'Password verified.' });
    } else {
      // Jika password salah, kirim respons error
      return NextResponse.json({ success: false, message: 'Invalid password.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Verify-reset error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}