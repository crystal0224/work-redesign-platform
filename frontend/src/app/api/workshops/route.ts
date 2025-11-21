import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/workshops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Workshop creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create workshop' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const response = await fetch(`${BACKEND_URL}/api/workshops/${id}`);
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(
      { success: false, error: 'Workshop ID is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Workshop fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workshop' },
      { status: 500 }
    );
  }
}
