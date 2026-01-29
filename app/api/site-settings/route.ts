/**
 * API Route: Site Settings
 * GET /api/site-settings
 * 
 * Fetches site settings and statistics
 * Stats come from Prisma (apm_ tables), help content from Directus CMS
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

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
        // Try to get CMS-managed settings first
        let settings: SiteSettings | null = null;

        try {
            const settingsRes = await fetch(`${DIRECTUS_URL}/items/site_settings`, {
                cache: 'no-store',
            });

            if (settingsRes.ok) {
                const data = await settingsRes.json();
                if (data.data) {
                    settings = {
                        stats: {
                            totalLomba: data.data.stat_lomba || 0,
                            totalPrestasi: data.data.stat_prestasi || 0,
                            totalMahasiswa: data.data.stat_mahasiswa || 0,
                            totalExpo: data.data.stat_expo || 0,
                        },
                        help: {
                            title: data.data.help_title || 'Butuh Bantuan?',
                            description: data.data.help_description || 'Tim APM siap membantu Anda',
                            email: data.data.help_email || 'apm@polinema.ac.id',
                            whatsapp: data.data.help_whatsapp || '+62 812-3456-7890',
                            showLocation: data.data.help_show_location || false,
                            location: data.data.help_location,
                        },
                    };
                }
            }
        } catch {
            // CMS collection might not exist, fall back to calculated
        }

        // If no CMS settings or stats are 0, calculate from data
        if (!settings || (settings.stats.totalLomba === 0 && settings.stats.totalPrestasi === 0)) {
            const calculatedStats = await getCalculatedStats();
            settings = {
                stats: calculatedStats,
                help: settings?.help || {
                    title: 'Butuh Bantuan?',
                    description: 'Tim APM siap membantu Anda',
                    email: 'apm@polinema.ac.id',
                    whatsapp: '+62 812-3456-7890',
                    showLocation: false,
                },
            };
        }

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
