# 🚀 APM Portal - Quick Deployment Guide

## One-Command Deployment

### Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh --init
```

### Windows:
```powershell
.\deploy.ps1 -Init
```

---

## What This Does

1. ✅ Starts PostgreSQL 15 container
2. ✅ Starts Directus 10.10 container
3. ✅ Waits for services to be healthy
4. ✅ Creates all Directus collections with proper schema
5. ✅ Sets up public read permissions
6. ✅ Creates initial site_settings data
7. ✅ Builds and starts Next.js app

---

## Prerequisites

- **Docker** & **Docker Compose** installed
- **Node.js 18+** installed
- Port 3000, 5432, 8055 available

---

## After Deployment

### Access Points
- 🌐 **Website**: http://localhost:3000
- 📊 **Directus Admin**: http://localhost:8055

### Admin Login
- **Email**: admin@apm-portal.id
- **Password**: Admin@APM2026!

⚠️ **CHANGE THESE IN PRODUCTION!**

---

## Deployment Options

### First Time Setup
```bash
./deploy.sh --init    # Linux/Mac
.\deploy.ps1 -Init    # Windows
```

### Update Existing
```bash
./deploy.sh --update  # Linux/Mac
.\deploy.ps1 -Update  # Windows
```

### Reset Everything
```bash
./deploy.sh --reset   # Linux/Mac (deletes all data!)
.\deploy.ps1 -Reset   # Windows (deletes all data!)
```

---

## Production Configuration

### 1. Create `.env.production`
```env
# Database
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=apm_portal

# Directus
DIRECTUS_KEY=<random-32-char-key>
DIRECTUS_SECRET=<random-32-char-secret>
DIRECTUS_URL=https://cms.yourdomain.com
NEXT_PUBLIC_DIRECTUS_URL=https://cms.yourdomain.com
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=<strong-admin-password>

# Next.js
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2. Generate Secrets
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

---

## Directus Collections

After deployment, these collections are available:

| Collection | Purpose |
|------------|---------|
| `lomba` | Competition/contest listings |
| `prestasi` | Student achievements with approval workflow |
| `prestasi_tim` | Team members for achievements |
| `expo` | Events and exhibitions |
| `submissions` | Form submissions |
| `pages` | Editable page content (About, Visi Misi, etc) |
| `team_members` | Organization structure |
| `resources` | Tips, templates, guides |
| `site_settings` | Global site configuration (singleton) |

### Prestasi Approval Workflow

1. User submits prestasi → `status: pending`
2. Admin reviews → `status: approved` or `status: rejected`
3. Admin toggles visibility → `is_published: true/false`

Only `is_published: true` & `status: approved` prestasi shown on website.

---

## Troubleshooting

### Directus won't start
```bash
# Check logs
docker-compose logs directus

# Restart services
docker-compose restart
```

### Schema setup failed
```bash
# Run manually
node scripts/setup-directus-complete.js
```

### Port already in use
```bash
# Check what's using the port
lsof -i :8055  # Linux/Mac
netstat -ano | findstr :8055  # Windows
```

---

## Maintenance

### View Logs
```bash
docker-compose logs -f
```

### Backup Database
```bash
docker exec apm_postgres pg_dump -U apm_user apm_portal > backup.sql
```

### Restore Database
```bash
docker exec -i apm_postgres psql -U apm_user apm_portal < backup.sql
```

---

## Support

If you encounter issues:
1. Check `docker-compose logs`
2. Verify all environment variables are set
3. Ensure Docker has enough resources (2GB+ RAM)

---

**Made with ❤️ for Portal Prestasi Mahasiswa**
