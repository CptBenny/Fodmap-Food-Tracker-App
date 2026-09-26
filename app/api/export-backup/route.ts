import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for temporary backup downloads (expires after 15 minutes)
interface StoredBackup {
  content: string;
  fileName: string;
  createdAt: number;
}

const backupCache = new Map<string, StoredBackup>();

// Clean up expired backups older than 15 minutes
function cleanOldBackups() {
  const now = Date.now();
  const maxAge = 15 * 60 * 1000;
  for (const [id, item] of backupCache.entries()) {
    if (now - item.createdAt > maxAge) {
      backupCache.delete(id);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    cleanOldBackups();

    const contentType = req.headers.get('content-type') || '';
    let data: any;
    let fileName = `fodmap_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      data = body.data;
      if (body.fileName) fileName = body.fileName;
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const rawJson = formData.get('jsonData') as string;
      const customFileName = formData.get('fileName') as string;
      if (customFileName) fileName = customFileName;
      try {
        data = JSON.parse(rawJson);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }

      // If form POST, can directly return file attachment
      const jsonStr = JSON.stringify(data, null, 2);
      return new NextResponse(jsonStr, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // Generate unique download ID
    const downloadId = 'bk_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

    backupCache.set(downloadId, {
      content: jsonStr,
      fileName,
      createdAt: Date.now(),
    });

    const downloadUrl = `/api/export-backup?id=${downloadId}&filename=${encodeURIComponent(fileName)}`;

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName,
    });
  } catch (error: any) {
    console.error('Error in POST /api/export-backup:', error);
    return NextResponse.json(
      { error: 'Failed to generate backup export: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    cleanOldBackups();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const paramFileName = searchParams.get('filename');

    if (!id || !backupCache.has(id)) {
      return NextResponse.json(
        { error: 'Backup download link has expired or is invalid. Please request a new export from the app.' },
        { status: 404 }
      );
    }

    const backup = backupCache.get(id)!;
    const finalFileName = paramFileName || backup.fileName || 'fodmap_tracker_backup.json';

    return new NextResponse(backup.content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${finalFileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/export-backup:', error);
    return NextResponse.json(
      { error: 'Failed to download backup: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}
