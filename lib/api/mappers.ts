/**
 * Field Mappers
 * 
 * Maps between API field names and database field names.
 * This helps maintain backward compatibility with frontend while
 * using the actual database schema.
 */

// ================================
// LOMBA MAPPINGS
// ================================

/**
 * Map API input to Prisma Lomba create data
 */
export function mapLombaInput(input: Record<string, unknown>) {
  return {
    nama_lomba: input.nama_lomba,
    slug: input.slug,
    deskripsi: input.deskripsi,
    kategori: input.kategori,
    tingkat: input.tingkat,
    // API uses deadline_pendaftaran, DB uses deadline
    deadline: input.deadline_pendaftaran ? new Date(input.deadline_pendaftaran as string) : input.deadline ? new Date(input.deadline as string) : undefined,
    tanggal_pelaksanaan: input.tanggal_pelaksanaan ? new Date(input.tanggal_pelaksanaan as string) : undefined,
    penyelenggara: input.penyelenggara,
    lokasi: input.lokasi,
    sumber: input.sumber || 'internal',
    tipe_pendaftaran: input.tipe_pendaftaran || 'internal',
    link_pendaftaran: input.link_pendaftaran,
    custom_form: input.form_config || input.custom_form,
    // API uses persyaratan, DB uses syarat_ketentuan
    syarat_ketentuan: input.persyaratan || input.syarat_ketentuan,
    hadiah: input.hadiah,
    // API uses biaya_pendaftaran, DB uses biaya
    biaya: input.biaya_pendaftaran ?? input.biaya ?? 0,
    kontak_panitia: input.kontak_panitia,
    // API uses poster_url, DB uses poster
    poster: input.poster_url || input.poster,
    tags: input.tags,
    is_featured: input.is_featured ?? false,
    is_urgent: input.is_urgent ?? false,
    status: input.status || 'draft',
  }
}

/**
 * Map Prisma Lomba to API response format
 */
export function mapLombaOutput(lomba: Record<string, unknown>) {
  return {
    ...lomba,
    // Add API-friendly aliases
    deadline_pendaftaran: lomba.deadline,
    persyaratan: lomba.syarat_ketentuan,
    biaya_pendaftaran: lomba.biaya,
    poster_url: lomba.poster,
    form_config: lomba.custom_form,
  }
}

// ================================
// LOMBA REGISTRATION MAPPINGS
// ================================

/**
 * Map API input to Prisma LombaRegistration create data
 */
export function mapLombaRegistrationInput(input: Record<string, unknown>) {
  return {
    // API uses nama_lengkap, DB uses nama
    nama: input.nama_lengkap || input.nama,
    nim: input.nim,
    email: input.email,
    whatsapp: input.whatsapp,
    fakultas: input.fakultas,
    prodi: input.prodi,
    angkatan: input.angkatan ? parseInt(input.angkatan as string) : undefined,
    custom_data: input.form_data || input.custom_data,
    status: input.status || 'pending',
  }
}

/**
 * Map Prisma LombaRegistration to API response format
 */
export function mapLombaRegistrationOutput(reg: Record<string, unknown>) {
  return {
    ...reg,
    // Add API-friendly aliases
    nama_lengkap: reg.nama,
    form_data: reg.custom_data,
  }
}

// ================================
// EXPO MAPPINGS
// ================================

export function mapExpoInput(input: Record<string, unknown>) {
  return {
    nama_event: input.nama_event,
    slug: input.slug,
    tema: input.tema,
    deskripsi: input.deskripsi,
    tanggal_mulai: input.tanggal_mulai ? new Date(input.tanggal_mulai as string) : undefined,
    tanggal_selesai: input.tanggal_selesai ? new Date(input.tanggal_selesai as string) : undefined,
    waktu_mulai: input.waktu_mulai,
    waktu_selesai: input.waktu_selesai,
    lokasi: input.lokasi,
    poster: input.poster_url || input.poster,
    gallery: input.gallery,
    status: input.status || 'upcoming',
    is_featured: input.is_featured ?? false,
    registration_open: input.registration_open ?? true,
    registration_deadline: input.registration_deadline ? new Date(input.registration_deadline as string) : undefined,
    max_participants: input.max_participants,
  }
}

export function mapExpoOutput(expo: Record<string, unknown>) {
  return {
    ...expo,
    poster_url: expo.poster,
  }
}

// ================================
// EXPO REGISTRATION MAPPINGS
// ================================

export function mapExpoRegistrationInput(input: Record<string, unknown>) {
  return {
    nama: input.nama_lengkap || input.nama,
    nim: input.nim,
    email: input.email,
    whatsapp: input.whatsapp,
    fakultas: input.fakultas,
    prodi: input.prodi,
    tipe: input.category || input.tipe || 'visitor',
    nama_tim: input.nama_tim,
    booth_number: input.booth_number,
    custom_data: input.form_data || input.custom_data,
    status: input.status || 'pending',
  }
}

export function mapExpoRegistrationOutput(reg: Record<string, unknown>) {
  return {
    ...reg,
    nama_lengkap: reg.nama,
    category: reg.tipe,
    form_data: reg.custom_data,
  }
}
