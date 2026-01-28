/**
 * Seed Data Script for APM Portal
 * Seeds initial content blocks, master prodi, and site settings
 * 
 * Usage: npx ts-node scripts/seed-content-blocks.ts
 */

export { }; // Make this a module

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://directus-apmt.flx.web.id';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@apmt.flx.web.id';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Nyawitnihanak67';

interface ContentBlock {
    key: string;
    title: string;
    subtitle?: string;
    description?: string;
    cta_text?: string;
    cta_link?: string;
    is_active: boolean;
}

interface MasterProdi {
    kode_prodi: string;
    nama_prodi: string;
    jenjang: string;
    is_active: boolean;
    urutan: number;
}

const contentBlocks: ContentBlock[] = [
    {
        key: 'home_hero',
        title: 'Wujudkan Potensi, Raih Prestasi Kampus!',
        subtitle: 'Portal Ajang Prestasi Mahasiswa',
        description: 'Temukan peluang emas, berkompetisi di tingkat nasional, dan bagikan juga prestasi Anda bersama komunitas mahasiswa berprestasi.',
        cta_text: 'Jelajahi Lomba',
        cta_link: '/lomba',
        is_active: true,
    },
    {
        key: 'help_contact',
        title: 'Butuh Bantuan?',
        subtitle: 'Tim APM siap membantu Anda',
        description: 'Hubungi tim APM melalui email untuk pertanyaan seputar portal, pendaftaran lomba, atau verifikasi prestasi.',
        is_active: true,
    },
    {
        key: 'org_structure',
        title: 'Struktur Organisasi',
        subtitle: 'Tim Pengelola APM',
        description: '<p>Tim pengelola APM terdiri dari dosen pembimbing dan mahasiswa yang berkomitmen untuk memfasilitasi prestasi mahasiswa.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
        is_active: true,
    },
    {
        key: 'cta_submit',
        title: 'Punya Prestasi yang Ingin Dibagikan?',
        subtitle: '',
        description: 'Submit prestasi Anda sekarang dan jadilah inspirasi bagi mahasiswa lainnya. Prestasi Anda akan ditampilkan di galeri setelah verifikasi.',
        cta_text: 'Submit Prestasi Sekarang',
        cta_link: '/submission',
        is_active: true,
    },
];

const masterProdi: MasterProdi[] = [
    {
        kode_prodi: 'd3-tektel',
        nama_prodi: 'D3 Teknik Telekomunikasi',
        jenjang: 'd3',
        is_active: true,
        urutan: 1,
    },
    {
        kode_prodi: 'd4-jtd',
        nama_prodi: 'D4 Jaringan Telekomunikasi Digital',
        jenjang: 'd4',
        is_active: true,
        urutan: 2,
    },
];

const siteSettings = {
    stat_lomba: 0, // Will be auto-calculated
    stat_prestasi: 0,
    stat_mahasiswa: 0,
    stat_expo: 0,
    help_title: 'Butuh Bantuan?',
    help_description: 'Tim APM siap membantu Anda dengan pertanyaan seputar portal, pendaftaran lomba, atau verifikasi prestasi.',
    help_email: 'apm@polinema.ac.id',
    help_show_location: false, // No physical location shown
    help_location: '',
};

async function main() {
    console.log('🌱 Starting Seed Data Script...\n');

    // 1. Login to get access token
    console.log('1️⃣ Logging in to Directus...');
    const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    if (!loginRes.ok) {
        console.error('❌ Failed to login:', await loginRes.text());
        console.log('\n📋 Make sure Directus is running and credentials are correct.');
        process.exit(1);
    }

    const { data: authData } = await loginRes.json();
    const token = authData.access_token;
    console.log('✅ Logged in successfully!\n');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    // 2. Seed Content Blocks
    console.log('2️⃣ Seeding content blocks...\n');
    for (const block of contentBlocks) {
        try {
            // Check if exists
            const checkRes = await fetch(
                `${DIRECTUS_URL}/items/apm_content_blocks?filter[key][_eq]=${block.key}`,
                { headers }
            );
            const checkData = await checkRes.json();

            if (checkData.data && checkData.data.length > 0) {
                console.log(`   ⚠️  Content block "${block.key}" already exists, skipping...`);
                continue;
            }

            const res = await fetch(`${DIRECTUS_URL}/items/apm_content_blocks`, {
                method: 'POST',
                headers,
                body: JSON.stringify(block),
            });

            if (res.ok) {
                console.log(`   ✅ Created content block: ${block.key}`);
            } else {
                console.log(`   ❌ Failed to create ${block.key}:`, await res.text());
            }
        } catch (error) {
            console.log(`   ❌ Error creating ${block.key}:`, error);
        }
    }

    // 3. Seed Master Prodi
    console.log('\n3️⃣ Seeding master prodi...\n');
    for (const prodi of masterProdi) {
        try {
            // Check if exists
            const checkRes = await fetch(
                `${DIRECTUS_URL}/items/apm_master_prodi?filter[kode_prodi][_eq]=${prodi.kode_prodi}`,
                { headers }
            );
            const checkData = await checkRes.json();

            if (checkData.data && checkData.data.length > 0) {
                console.log(`   ⚠️  Prodi "${prodi.kode_prodi}" already exists, skipping...`);
                continue;
            }

            const res = await fetch(`${DIRECTUS_URL}/items/apm_master_prodi`, {
                method: 'POST',
                headers,
                body: JSON.stringify(prodi),
            });

            if (res.ok) {
                console.log(`   ✅ Created prodi: ${prodi.nama_prodi}`);
            } else {
                console.log(`   ❌ Failed to create ${prodi.kode_prodi}:`, await res.text());
            }
        } catch (error) {
            console.log(`   ❌ Error creating ${prodi.kode_prodi}:`, error);
        }
    }

    // 4. Seed/Update Site Settings
    console.log('\n4️⃣ Updating site settings...\n');
    try {
        // Check if singleton exists
        const checkRes = await fetch(`${DIRECTUS_URL}/items/apm_site_settings`, { headers });

        if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.data) {
                // Update existing
                const updateRes = await fetch(`${DIRECTUS_URL}/items/apm_site_settings`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(siteSettings),
                });
                if (updateRes.ok) {
                    console.log('   ✅ Updated site settings');
                }
            } else {
                // Create new
                const createRes = await fetch(`${DIRECTUS_URL}/items/apm_site_settings`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ id: 1, ...siteSettings }),
                });
                if (createRes.ok) {
                    console.log('   ✅ Created site settings');
                }
            }
        }
    } catch (error) {
        console.log('   ⚠️  Could not update site settings:', error);
    }

    console.log('\n✅ Seed data complete!');
    console.log('\n📋 Content blocks seeded:');
    contentBlocks.forEach(b => console.log(`   - ${b.key}: ${b.title}`));
    console.log('\n📋 Program studi seeded:');
    masterProdi.forEach(p => console.log(`   - ${p.kode_prodi}: ${p.nama_prodi}`));
}

main().catch(console.error);
