# Backend Redesign Plan - Submission Workflow

## 🎯 Goals
1. **Stable** - No more Directus authentication issues
2. **Secure** - Proper validation, rate limiting, CSRF protection
3. **Maintainable** - Clean separation of concerns
4. **Performant** - Direct DB access, optimized queries

---

## 📐 Architecture

### Current (Problematic)
```
Frontend → Next.js API → Directus API → PostgreSQL
                ↓
           Token issues, 401 errors, mapping complexity
```

### New (Proposed)
```
Frontend → Next.js API Routes → Prisma ORM → PostgreSQL (direct)
                ↓
           Type-safe, no token issues, direct control
```

---

## 🔧 Tech Stack

### Core
- **ORM**: Prisma (type-safe, migrations, great DX)
- **Validation**: Zod (schema validation)
- **File Upload**: Uploadthing or Cloudinary (avoid filesystem issues)
- **Auth**: NextAuth.js for admin (already setup?)

### Security
- **Rate Limiting**: `@upstash/ratelimit` or `express-rate-limit`
- **CSRF Protection**: Built-in Next.js
- **Input Sanitization**: Zod + custom validators
- **SQL Injection**: Prevented by Prisma (parameterized queries)

---

## 📦 Database Schema (Prisma)

### Tables to Own (bypass Directus)
```prisma
model PrestasiSubmission {
  id              Int       @id @default(autoincrement())
  judul           String
  nama_lomba      String
  tingkat         String
  peringkat       String
  tanggal         DateTime?
  sertifikat      String?   // URL or file path
  
  // Submission metadata
  status          String    @default("pending") // pending, approved, rejected
  is_published    Boolean   @default(false)
  reviewer_notes  String?
  reviewed_at     DateTime?
  
  // Submitter info
  submitter_name  String
  submitter_nim   String
  submitter_email String
  
  // Timestamps
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  
  // Relations
  team_members    TeamMember[]
  
  @@index([status])
  @@index([is_published])
  @@index([submitter_nim])
}

model TeamMember {
  id            Int      @id @default(autoincrement())
  prestasi_id   Int
  nama          String
  nim           String
  prodi         String?
  
  prestasi      PrestasiSubmission @relation(fields: [prestasi_id], references: [id], onDelete: Cascade)
  
  @@index([prestasi_id])
}

model LombaRegistration {
  id            Int       @id @default(autoincrement())
  lomba_id      Int       // FK to Directus lomba (keep CMS for lomba content)
  
  // Participant info
  nama          String
  nim           String
  email         String
  phone         String?
  prodi         String?
  
  // Team info (if applicable)
  team_name     String?
  team_members  Json?     // Array of team members
  
  // Status
  status        String    @default("pending")
  payment_proof String?
  verified_at   DateTime?
  
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  @@index([lomba_id])
  @@index([status])
  @@index([email])
}

model ExpoRegistration {
  // Similar to LombaRegistration
  id            Int       @id @default(autoincrement())
  expo_id       Int
  nama          String
  nim           String
  email         String
  status        String    @default("pending")
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  
  @@index([expo_id])
  @@index([status])
}
```

---

## 🔒 Security Implementation

### 1. Rate Limiting
```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 requests per hour
  analytics: true,
});

// Usage in API route
const identifier = request.ip ?? "anonymous";
const { success } = await ratelimit.limit(identifier);
if (!success) return Response.json({ error: "Too many requests" }, { status: 429 });
```

### 2. Input Validation
```typescript
// lib/validations/prestasi.ts
import { z } from "zod";

export const prestasiSubmissionSchema = z.object({
  judul: z.string().min(5).max(200),
  nama_lomba: z.string().min(3).max(200),
  tingkat: z.enum(["regional", "nasional", "internasional"]),
  peringkat: z.string().min(1).max(50),
  tanggal: z.string().datetime().optional(),
  
  submitter_name: z.string().min(3).max(100),
  submitter_nim: z.string().regex(/^\d{10}$/, "NIM harus 10 digit"),
  submitter_email: z.string().email().endsWith("@unisnu.ac.id"),
  
  team_members: z.array(z.object({
    nama: z.string().min(3),
    nim: z.string().regex(/^\d{10}$/),
    prodi: z.string().optional(),
  })).optional(),
});
```

### 3. File Upload (Uploadthing)
```typescript
// app/api/uploadthing/core.ts
import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  prestasiCertificate: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      // Optional auth check
      return { userId: "public" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("File uploaded:", file.url);
      return { url: file.url };
    }),
};
```

---

## 🚀 API Routes Structure

```
app/api/
├── submissions/
│   ├── prestasi/
│   │   ├── route.ts          # POST - Submit prestasi
│   │   └── [id]/
│   │       └── route.ts      # GET - Get submission status
│   ├── lomba/
│   │   ├── [id]/
│   │   │   └── register/
│   │   │       └── route.ts  # POST - Register to lomba
│   └── expo/
│       ├── [id]/
│       │   └── register/
│       │       └── route.ts  # POST - Register to expo
│
├── admin/
│   ├── submissions/
│   │   ├── route.ts          # GET - List all submissions (paginated)
│   │   └── [id]/
│   │       ├── route.ts      # GET, PATCH - View/Update submission
│   │       └── review/
│   │           └── route.ts  # POST - Approve/Reject
│
└── uploadthing/
    ├── core.ts
    └── route.ts
```

---

## 📝 Implementation Steps

### Phase 1: Setup (30 mins)
1. ✅ Install dependencies
   ```bash
   npm install prisma @prisma/client zod uploadthing @uploadthing/react
   npm install -D prisma
   ```

2. ✅ Initialize Prisma
   ```bash
   npx prisma init
   ```

3. ✅ Configure DATABASE_URL in .env
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/apm_portal?schema=public"
   ```

4. ✅ Create Prisma schema (see above)

5. ✅ Generate Prisma Client
   ```bash
   npx prisma generate
   npx prisma db push  # or prisma migrate dev
   ```

### Phase 2: Core API (1-2 hours)
1. ✅ Create validation schemas (`lib/validations/`)
2. ✅ Create Prisma service layer (`lib/services/prestasi.service.ts`)
3. ✅ Build submission API routes
4. ✅ Add error handling middleware

### Phase 3: File Upload (30 mins)
1. ✅ Setup Uploadthing
2. ✅ Replace Directus file upload with Uploadthing
3. ✅ Update forms to use new upload

### Phase 4: Admin Integration (1 hour)
1. ✅ Update admin dashboard to use new API
2. ✅ Test verification workflow
3. ✅ Add logging & monitoring

### Phase 5: Migration (30 mins)
1. ✅ Migrate existing data from Directus to new tables (optional)
2. ✅ Update frontend forms
3. ✅ Test end-to-end flow
4. ✅ Deploy

---

## 🧪 Testing Checklist

### Submission Flow
- [ ] User can submit prestasi with certificate
- [ ] Validation works (invalid NIM, email, etc.)
- [ ] Rate limiting prevents spam
- [ ] File upload succeeds
- [ ] Email confirmation sent (optional)

### Admin Flow
- [ ] Admin can view all submissions
- [ ] Admin can filter by status
- [ ] Admin can approve/reject
- [ ] Status updates reflect immediately
- [ ] Approved items auto-publish

### Security
- [ ] SQL injection prevented (Prisma handles this)
- [ ] XSS prevented (Next.js handles this)
- [ ] CSRF protection enabled
- [ ] Rate limiting works
- [ ] File upload validates file type

---

## 🎨 Benefits of This Approach

| Aspect | Old (Directus) | New (Custom) |
|--------|---------------|--------------|
| **Auth** | Token expiry issues | No token needed for submissions |
| **Errors** | 401, 403, mapping issues | Clean error messages |
| **Speed** | 2 API calls (Next → Directus) | 1 direct DB query |
| **Control** | Limited by Directus | Full control over logic |
| **Debug** | Hard to trace | Easy to add logs |
| **Type Safety** | Manual typing | Prisma auto-generates |

---

## 🔄 Fallback Plan

**Keep Directus for:**
- Static content (pages, FAQ, tips)
- Admin CMS for non-technical users
- Initial lomba/expo content management

**Use Custom Backend for:**
- Prestasi submissions ✅
- Lomba registrations ✅
- Expo registrations ✅
- Any workflow that needs approval

**Gradual Migration:**
- Phase 1: Submissions only (this plan)
- Phase 2: All registrations
- Phase 3: Consider full migration if successful

---

## 📞 Next Steps

**Mau implement sekarang?**
1. Saya bisa setup Prisma + schema
2. Buat API routes baru
3. Test submission flow
4. Update frontend forms

**Atau mau diskusi dulu:**
- Database schema details?
- File upload strategy?
- Admin authentication?

**Your call!** 🚀
