import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const htmlPath = path.join(publicDir, 'index.html');

    const standaloneHtml = await fs.promises.readFile(htmlPath, 'utf8');

    return new NextResponse(standaloneHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'attachment; filename="index.html"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error generating standalone download:', error);
    return NextResponse.json(
      { error: 'Failed to generate standalone HTML: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}
