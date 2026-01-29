/**
 * API Route: Deadline Reminders
 * GET /api/reminders/deadlines
 * 
 * Fetches upcoming lomba deadlines and can trigger reminder notifications
 * This endpoint can be called by a cron job to send email reminders
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface UpcomingDeadline {
  lomba: {
    id: number;
    nama_lomba: string;
    slug: string;
    deadline: Date;
    penyelenggara: string | null;
  };
  daysUntilDeadline: number;
  registrations: Array<{
    id: number;
    nama: string;
    email: string;
    nim: string;
    lomba_id: number;
  }>;
}

/**
 * GET /api/reminders/deadlines
 * 
 * Query params:
 * - days: number of days to look ahead (default: 7)
 * - action: 'check' (default) or 'send' to actually send reminders
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysAhead = parseInt(searchParams.get('days') || '7');
    const action = searchParams.get('action') || 'check';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    // Fetch lomba with upcoming deadlines using Prisma
    const upcomingLomba = await prisma.lomba.findMany({
      where: {
        is_deleted: false,
        deadline: {
          gte: today,
          lte: futureDate,
        },
      },
      orderBy: { deadline: 'asc' },
      select: {
        id: true,
        nama_lomba: true,
        slug: true,
        deadline: true,
        penyelenggara: true,
      },
    });

    if (upcomingLomba.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tidak ada deadline dalam periode yang ditentukan',
        data: [],
      });
    }

    // Group by days until deadline
    const upcomingDeadlines: UpcomingDeadline[] = [];
    
    for (const lomba of upcomingLomba) {
      if (!lomba.deadline) continue;
      
      const deadlineDate = new Date(lomba.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      const diffTime = deadlineDate.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Fetch registrations for this lomba
      const registrations = await prisma.lombaRegistration.findMany({
        where: {
          lomba_id: lomba.id,
          status: 'registered',
        },
        select: {
          id: true,
          nama: true,
          email: true,
          nim: true,
          lomba_id: true,
        },
      });

      upcomingDeadlines.push({
        lomba: {
          id: lomba.id,
          nama_lomba: lomba.nama_lomba || '',
          slug: lomba.slug || '',
          deadline: lomba.deadline,
          penyelenggara: lomba.penyelenggara,
        },
        daysUntilDeadline: daysUntil,
        registrations,
      });
    }

    // Group by reminder thresholds (1 day, 3 days, 7 days)
    const reminders = {
      urgent: upcomingDeadlines.filter(d => d.daysUntilDeadline <= 1), // Tomorrow or today
      soon: upcomingDeadlines.filter(d => d.daysUntilDeadline > 1 && d.daysUntilDeadline <= 3), // 2-3 days
      upcoming: upcomingDeadlines.filter(d => d.daysUntilDeadline > 3), // 4+ days
    };

    // If action is 'send', we would send emails here
    const emailsToSend: Array<{
      to: string;
      subject: string;
      body: string;
      urgency: string;
    }> = [];

    if (action === 'send') {
      for (const deadline of upcomingDeadlines) {
        for (const reg of deadline.registrations) {
          if (!reg.email) continue;
          
          const urgency = deadline.daysUntilDeadline <= 1 ? 'URGENT' : 
                          deadline.daysUntilDeadline <= 3 ? 'SEGERA' : 'PENGINGAT';
          
          emailsToSend.push({
            to: reg.email,
            subject: `[${urgency}] Deadline ${deadline.lomba.nama_lomba} - ${deadline.daysUntilDeadline === 0 ? 'HARI INI' : `${deadline.daysUntilDeadline} hari lagi`}`,
            body: `
Halo ${reg.nama || 'Peserta'},

Ini adalah pengingat bahwa deadline untuk lomba "${deadline.lomba.nama_lomba}" 
${deadline.daysUntilDeadline === 0 ? 'adalah HARI INI!' : `tinggal ${deadline.daysUntilDeadline} hari lagi.`}

Detail Lomba:
- Nama: ${deadline.lomba.nama_lomba}
- Penyelenggara: ${deadline.lomba.penyelenggara || '-'}
- Deadline: ${deadline.lomba.deadline.toLocaleDateString('id-ID', { 
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
})}

Pastikan Anda sudah menyiapkan semua berkas yang diperlukan.

Salam,
Tim APM Polinema
            `.trim(),
            urgency,
          });
        }
      }

      console.log(`[Reminders] Would send ${emailsToSend.length} emails`);
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalLomba: upcomingLomba.length,
        urgent: reminders.urgent.length,
        soon: reminders.soon.length,
        upcoming: reminders.upcoming.length,
        emailsQueued: emailsToSend.length,
      },
      reminders: {
        urgent: reminders.urgent.map(d => ({
          lombaId: d.lomba.id,
          namaLomba: d.lomba.nama_lomba,
          deadline: d.lomba.deadline.toISOString(),
          daysUntil: d.daysUntilDeadline,
          registrationCount: d.registrations.length,
        })),
        soon: reminders.soon.map(d => ({
          lombaId: d.lomba.id,
          namaLomba: d.lomba.nama_lomba,
          deadline: d.lomba.deadline.toISOString(),
          daysUntil: d.daysUntilDeadline,
          registrationCount: d.registrations.length,
        })),
        upcoming: reminders.upcoming.map(d => ({
          lombaId: d.lomba.id,
          namaLomba: d.lomba.nama_lomba,
          deadline: d.lomba.deadline.toISOString(),
          daysUntil: d.daysUntilDeadline,
          registrationCount: d.registrations.length,
        })),
      },
      ...(action === 'send' && { emailsQueued: emailsToSend }),
    });

  } catch (error) {
    console.error('Error fetching deadlines:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reminders/deadlines
 * 
 * Create a custom reminder for a specific lomba
 * Note: This still uses Directus as reminders is a CMS feature
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lomba_id, reminder_date, message } = body;

    if (!lomba_id || !reminder_date) {
      return NextResponse.json(
        { error: 'lomba_id dan reminder_date wajib diisi' },
        { status: 400 }
      );
    }

    // Note: For now, reminders are not implemented in Prisma
    // This would need a reminders table in the schema
    return NextResponse.json({
      success: true,
      message: 'Fitur pengingat custom belum diimplementasikan',
      data: { lomba_id, reminder_date, message },
    });

  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
