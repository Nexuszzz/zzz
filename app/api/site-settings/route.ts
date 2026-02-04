/**
 * API Route: Site Settings
 * GET /api/site-settings
 * 
 * Fetches site settings and statistics
 * Stats come from Prisma (apm_ tables)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';

interface SiteStats {
    totalLomba: number;
    totalPrestasi: number;
    totalMahasiswa: number;
    totalExpo: number;
}

interface HelpContent {
    title: string;
    description: string;
    email: string;
    whatsapp?: string;
    showLocation: boolean;
    location?: string;
}

interface SiteSettings {
    stats: SiteStats;
    help: HelpContent;
}

async function getCalculatedStats(): Promise<SiteStats> {
    const stats: SiteStats = {
        totalLomba: 0,
        totalPrestasi: 0,
        totalMahasiswa: 0,
        totalExpo: 0,
    };

    try {
        // Get counts from Prisma (apm_ tables)
        const [lombaCount, prestasiCount, expoCount] = await Promise.all([
            prisma.lomba.count({ 
                where: { is_deleted: false, status: { not: 'closed' } } 
            }),
            prisma.prestasi.count({ 
                where: { is_published: true } 
            }),
            prisma.expo.count({ 
                where: { is_deleted: false } 
            }),
        ]);

        stats.totalLomba = lombaCount;
        stats.totalPrestasi = prestasiCount;
        stats.totalExpo = expoCount;

        // Get unique student count from prestasi team members
        const uniqueStudents = await prisma.prestasiTeamMember.groupBy({
            by: ['nim'],
            where: { nim: { not: '' } },
        });
        stats.totalMahasiswa = uniqueStudents.length;
    } catch (error) {
        console.error('Error calculating stats:', error);
    }

    return stats;
}

export async function GET() {
    try {
        // Calculate stats from Prisma database
        const calculatedStats = await getCalculatedStats();
        
        const settings = {
            stats: calculatedStats,
            help: {
                title: 'Butuh Bantuan?',
                description: 'Tim APM siap membantu Anda',
                email: 'apm@polinema.ac.id',
                whatsapp: '+62 812-3456-7890',
                showLocation: false,
            },
        };

        return NextResponse.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        console.error('Error fetching site settings:', error);

        // Return defaults on error
        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    totalLomba: 0,
                    totalPrestasi: 0,
                    totalMahasiswa: 0,
                    totalExpo: 0,
                },
                help: {
                    title: 'Butuh Bantuan?',
                    description: 'Tim APM siap membantu Anda',
                    email: 'apm@polinema.ac.id',
                    whatsapp: '+62 812-3456-7890',
                    showLocation: false,
                },
            },
        });
    }
}
