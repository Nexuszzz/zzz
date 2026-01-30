/**
 * Database Seeder
 * 
 * Seeds the database with initial data for development and testing.
 * Run with: npx tsx prisma/seed.ts
 */

import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const { Pool } = pg

// Create connection pool
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seeding...')

  // ================================
  // Create Admin Users
  // ================================
  console.log('Creating admin users...')

  const adminPassword = await bcrypt.hash('jtdwengdev', 12)

  const superadmin = await prisma.admin.upsert({
    where: { email: 'admin@apm.polinema.ac.id' },
    update: {},
    create: {
      email: 'admin@apm.polinema.ac.id',
      password_hash: adminPassword,
      name: 'Super Admin APM',
      role: 'superadmin',
      is_active: true
    }
  })
  console.log(`  ✓ Created superadmin: ${superadmin.email}`)

  const editor = await prisma.admin.upsert({
    where: { email: 'editor@apm.polinema.ac.id' },
    update: {},
    create: {
      email: 'editor@apm.polinema.ac.id',
      password_hash: adminPassword,
      name: 'Editor APM',
      role: 'editor',
      is_active: true
    }
  })
  console.log(`  ✓ Created editor: ${editor.email}`)

  // ================================
  // Create Expo Settings
  // ================================
  console.log('Creating expo settings...')

  const expoSettings = await prisma.expoSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      is_active: true,
      inactive_message: 'Belum ada expo saat ini. Nantikan update selanjutnya!',
      next_expo_date: null
    }
  })
  console.log(`  ✓ Created expo settings (id: ${expoSettings.id})`)

  // ================================
  // Create Sample Lomba
  // ================================
  console.log('Creating sample lomba...')

  const sampleLomba = await prisma.lomba.upsert({
    where: { slug: 'sample-lomba-internal' },
    update: {},
    create: {
      nama_lomba: 'Lomba Karya Tulis Ilmiah Internal',
      slug: 'sample-lomba-internal',
      deskripsi: 'Lomba karya tulis ilmiah untuk mahasiswa Undip. Ini adalah sample data untuk testing.',
      kategori: 'akademik',
      tingkat: 'internal',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      tanggal_pelaksanaan: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      penyelenggara: 'Akademik Prestasi Mahasiswa Undip',
      lokasi: 'Gedung Prof. Soedarto',
      sumber: 'internal',
      tipe_pendaftaran: 'internal',
      syarat_ketentuan: '1. Mahasiswa aktif Undip\\n2. Maksimal 3 orang per tim\\n3. Karya original',
      biaya: 0,
      is_featured: true,
      status: 'published',
      tags: ['lkti', 'karya-tulis', 'akademik'],
      hadiah: {
        juara1: 'Rp 3.000.000 + Sertifikat',
        juara2: 'Rp 2.000.000 + Sertifikat',
        juara3: 'Rp 1.000.000 + Sertifikat'
      },
      custom_form: {
        fields: [
          { id: 'nama', type: 'text', label: 'Nama Lengkap', required: true, order: 1 },
          { id: 'nim', type: 'nim', label: 'NIM', required: true, order: 2 },
          { id: 'email', type: 'email', label: 'Email', required: true, order: 3 },
          { id: 'whatsapp', type: 'phone', label: 'WhatsApp', required: true, order: 4 },
          { id: 'fakultas', type: 'fakultas', label: 'Fakultas', required: true, order: 5 },
          { id: 'prodi', type: 'prodi', label: 'Program Studi', required: true, order: 6 },
          { id: 'judul_karya', type: 'text', label: 'Judul Karya', required: true, order: 7 },
          { id: 'abstrak', type: 'textarea', label: 'Abstrak', required: true, order: 8 }
        ],
        settings: {
          submitButtonText: 'Daftar Sekarang',
          successMessage: 'Pendaftaran berhasil! Tim kami akan menghubungi Anda.',
          allowMultipleSubmissions: false
        }
      }
    }
  })
  console.log(`  ✓ Created sample lomba: ${sampleLomba.nama_lomba}`)

  // ================================
  // Create Sample Calendar Event
  // ================================
  console.log('Creating sample calendar events...')

  const sampleEvent = await prisma.calendarEvent.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Deadline LKTI Internal',
      description: 'Deadline pengumpulan karya tulis ilmiah internal',
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      all_day: true,
      type: 'deadline',
      color: '#EF4444'
    }
  })
  console.log(`  ✓ Created calendar event: ${sampleEvent.title}`)

  console.log('')
  console.log('✅ Database seeding completed!')
  console.log('')
  console.log('📝 Admin Credentials:')
  console.log('   Email: admin@apm.polinema.ac.id')
  console.log('   Password: jtdwengdev')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
