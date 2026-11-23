This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



# Panduan Setup & Pengerjaan Project UKK (Next.js + Prisma 7 + MySQL)

## 1. Inisialisasi Project & Instalasi Paket

Buat project Next.js baru:
```bash
npx create-next-app@latest ukk-project
```
Opsi konfigurasi:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **No**
- App Router: **Yes**
- Import alias (`@/*`): **Yes**

Masuk ke folder project dan instal Prisma 7 beserta package pendukung:
```bash
cd ukk-project
npm install -D prisma@7
npm install @prisma/client@7 bcryptjs
npm install -D @types/bcryptjs
```

Inisialisasi Shadcn UI dan tambahkan komponen dasar:
```bash
npx shadcn@latest init
npx shadcn@latest add button input label table dialog card
```

---

## 2. Konfigurasi Database & Prisma

1. Inisialisasi Prisma dengan provider MySQL:
   ```bash
   npx prisma init --datasource-provider mysql
   ```

2. Atur koneksi database di file `.env`:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/db_ukk"
   ```

3. Buat helper koneksi database di `lib/prisma.ts`:
   ```ts
   import { PrismaClient } from "@prisma/client";

   const globalForPrisma = globalThis as unknown as {
     prisma: PrismaClient | undefined;
   };

   export const prisma = globalForPrisma.prisma ?? new PrismaClient();

   if (process.env.NODE_ENV !== "production") {
     globalForPrisma.prisma = prisma;
   }
   ```

4. Definisikan model tabel di `prisma/schema.prisma`, lalu sinkronkan ke MySQL:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

---

## 3. Struktur Folder Aplikasi

```text
ukk-project/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── login/route.ts      # Endpoint autentikasi login
│   │   └── [nama-tabel]/
│   │       ├── route.ts            # GET (semua data) & POST (tambah data)
│   │       └── [id]/route.ts       # PUT (edit data) & DELETE (hapus data)
│   ├── admin/
│   │   ├── layout.tsx              # Layout & sidebar admin
│   │   ├── page.tsx                # Dashboard utama
│   │   └── [nama-tabel]/
│   │       └── page.tsx            # Halaman CRUD data
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Landing page & modal login
├── components/ui/                  # Komponen Shadcn UI
├── lib/
│   └── prisma.ts                   # Instance Prisma Client
└── prisma/
    └── schema.prisma               # Skema database
```

---

## 4. Urutan Pengerjaan Fitur CRUD

1. **Database & Seeding**
   - Buat seluruh model dan relasi (`@relation`) di `prisma/schema.prisma`.
   - Jalankan `npx prisma db push` dan `npx prisma generate`.
   - Isi minimal 1 akun admin awal ke tabel `User` melalui DBeaver / phpMyAdmin.

2. **Backend API Route (`app/api/...`)**
   - `app/api/[nama-tabel]/route.ts`: buat handler `GET` (`findMany`) dan `POST` (`create`).
   - `app/api/[nama-tabel]/[id]/route.ts`: buat handler `PUT` (`update`) dan `DELETE` (`delete`).

3. **Frontend (`app/admin/[nama-tabel]/page.tsx`)**
   - Ambil dan tampilkan data dari API `GET` ke komponen `<Table>`.
   - Buat form tambah & edit data menggunakan `<Dialog>` untuk mengirim request `POST` dan `PUT`.
   - Tambahkan tombol aksi hapus dengan konfirmasi untuk memanggil endpoint `DELETE`.

4. **Autentikasi & Redirect**
   - Buat endpoint `app/api/auth/login/route.ts` untuk memverifikasi email dan password.
   - Arahkan user ke `/admin` setelah login berhasil.

---

## 5. Perintah Penting (Development, Build & Git)

- **Menjalankan server lokal:**
  ```bash
  npm run dev
  ```

- **Uji build produksi sebelum presentasi:**
  ```bash
  npm run build
  ```

- **Push satu file tertentu ke GitHub:**
  ```bash
  git add path/ke/file.tsx
  git commit -m "pesan commit"
  git push origin master
  ```



  Dapur / Gudang (prisma/schema.prisma & MySQL): Tempat asli semua data disimpan dalam bentuk tabel.

Pelayan (app/api/.../route.ts): Tugasnya mondar-mandir mengambil pesanan dari layar depan, lalu menyuruh Prisma menyimpan/mengubah/menghapus data di MySQL. Halaman depan tidak bisa menyentuh database secara langsung tanpa lewat pelayan ini.

Meja Pelanggan / Layar (app/admin/.../page.tsx): Tampilan tombol, form, dan tabel yang dilihat dan diklik oleh pengguna.

Urutan Pengerjaan dari Nol (Step-by-Step)
Kalau kamu mulai membuat project UKK dari awal, ikuti 4 urutan ini supaya tidak bingung harus mulai dari file mana:

1. Siapkan Project & Hubungkan ke MySQL
Buat folder project Next.js (npx create-next-app@latest), lalu instal Prisma versi 7 (npm install -D prisma@7 dan npm install @prisma/client@7).

Buka file .env, lalu isi alamat database MySQL kamu (misalnya DATABASE_URL="mysql://root:@localhost:3306/db_ukk").

Buat file lib/prisma.ts sebagai "jembatan" agar Next.js bisa memanggil Prisma.

2. Buat Tabel di schema.prisma
Di file prisma/schema.prisma, tulis nama tabel dan kolom-kolomnya (misalnya model Jurusan punya id, kode, nama).

Jalankan npx prisma db push di terminal. Perintah ini otomatis membuatkan tabel tersebut di MySQL (bisa langsung kamu cek di DBeaver/phpMyAdmin).

3. Buat "Pelayan" API (app/api/...)
Setiap satu tabel CRUD selalu butuh 2 file API di dalam folder app/api/nama-tabel/:

route.ts (tanpa ID — untuk urusan massal/baru):

GET -> Ambil semua baris data untuk ditampilkan ke tabel.

POST -> Terima isian dari form, lalu simpan sebagai baris baru di database.

[id]/route.ts (pakai [id] — untuk urusan satu baris spesifik):

PUT -> Ubah data milik baris dengan id tertentu.

DELETE -> Hapus baris dengan id tertentu.

4. Buat Tampilan Halaman (app/admin/.../page.tsx)
Di file halaman inilah tombol dan tabel dibuat, lalu dihubungkan ke API di langkah 3 memakai fungsi fetch():

Read (Tampil): Saat halaman baru dibuka (useEffect), panggil fetch("/api/jurusan") lalu masukkan hasilnya ke state list untuk ditampilkan di <Table>.

Create (Tambah): Saat form disubmit, kirim data inputan lewat fetch("/api/jurusan", { method: "POST", body: ... }).

Update (Edit): Saat tombol Edit diklik, masukkan data lama ke form, lalu kirim perubahannya lewat fetch("/api/jurusan/1", { method: "PUT", body: ... }).

Delete (Hapus): Saat tombol Hapus diklik, panggil fetch("/api/jurusan/1", { method: "DELETE" }).

Bagian mana yang masih terasa paling membingungkan buat kamu—cara setup awal dan koneksi ke MySQL-nya, cara kerja route.ts (API), atau cara menghubungkan form tampilan ke API?



db
CREATE DATABASE IF NOT EXISTS `db_apartement_fix` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `db_apartement_fix`;

-- 1. Tabel Master Independen
CREATE TABLE `tbl_branch` (
  `branch_id` int(11) NOT NULL AUTO_INCREMENT,
  `kode_branch` varchar(10) NOT NULL,
  `nama_perusahaan` varchar(100) NOT NULL,
  `alamat_perusahaan` varchar(100) NOT NULL,
  `email_perusahaan` varchar(100) NOT NULL,
  `telepon_perusahaan` varchar(20) NOT NULL,
  `kecamatan_perusahaan` varchar(100) NOT NULL,
  `kota_perusahaan` varchar(100) NOT NULL,
  `provinsi_perusahaan` varchar(100) NOT NULL,
  `path_logo` varchar(255) DEFAULT NULL,
  `kode_pos` varchar(10) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`branch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_tipe_user` (
  `id_tipe_user` int(11) NOT NULL AUTO_INCREMENT,
  `tipe_user` varchar(100) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tipe_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_jabatan` (
  `kode_jabatan` varchar(10) NOT NULL,
  `nama_jabatan` varchar(100) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`kode_jabatan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_facility` (
  `kode_facility` varchar(10) NOT NULL,
  `nama_facility` varchar(150) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`kode_facility`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_currency` (
  `id_currency` int(11) NOT NULL AUTO_INCREMENT,
  `nama_currency` varchar(100) NOT NULL,
  `symbol_currency` varchar(20) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_currency`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_bulan` (
  `id_bulan` int(11) NOT NULL AUTO_INCREMENT,
  `no_bulan` varchar(2) NOT NULL,
  `nama_bulan` varchar(100) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_bulan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_tahun` (
  `id_tahun` int(11) NOT NULL AUTO_INCREMENT,
  `nama_tahun` varchar(100) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Tabel Users & Master Cabang
CREATE TABLE `tbl_users` (
  `id_user` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` int(11) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user`),
  KEY `idx_users_role` (`role`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role`) REFERENCES `tbl_tipe_user` (`id_tipe_user`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_type_unit` (
  `id_unit_type` int(11) NOT NULL AUTO_INCREMENT,
  `nama_type_unit` varchar(100) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_unit_type`),
  KEY `idx_type_unit_branch` (`branch_id`),
  CONSTRAINT `fk_type_unit_branch` FOREIGN KEY (`branch_id`) REFERENCES `tbl_branch` (`branch_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_floor` (
  `id_floor` int(11) NOT NULL AUTO_INCREMENT,
  `floor_no` varchar(100) NOT NULL,
  `name_floor` varchar(50) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_floor`),
  KEY `idx_floor_branch` (`branch_id`),
  CONSTRAINT `fk_floor_branch` FOREIGN KEY (`branch_id`) REFERENCES `tbl_branch` (`branch_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Tabel Aktor Internal, Unit & Pivot Fasilitas
CREATE TABLE `tbl_admin` (
  `id_admin` int(11) NOT NULL AUTO_INCREMENT,
  `nama_admin` varchar(100) NOT NULL,
  `telepon_admin` varchar(100) NOT NULL,
  `path_photo_admin` varchar(255) DEFAULT NULL,
  `id_user` varchar(10) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_admin`),
  KEY `idx_admin_user` (`id_user`),
  CONSTRAINT `fk_admin_user` FOREIGN KEY (`id_user`) REFERENCES `tbl_users` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_petugas` (
  `id_petugas` int(11) NOT NULL AUTO_INCREMENT,
  `nama_petugas` varchar(100) NOT NULL,
  `telepon_petugas` varchar(100) NOT NULL,
  `jenkel` enum('L','P') NOT NULL,
  `path_photo_petugas` varchar(255) DEFAULT NULL,
  `id_user` varchar(10) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_petugas`),
  KEY `idx_petugas_user` (`id_user`),
  KEY `idx_petugas_branch` (`branch_id`),
  CONSTRAINT `fk_petugas_user` FOREIGN KEY (`id_user`) REFERENCES `tbl_users` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_petugas_branch` FOREIGN KEY (`branch_id`) REFERENCES `tbl_branch` (`branch_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_karyawan` (
  `id_karyawan` int(11) NOT NULL AUTO_INCREMENT,
  `nama_karyawan` varchar(100) NOT NULL,
  `telepon_karyawan` varchar(100) NOT NULL,
  `alamat_domisili_karyawan` varchar(255) NOT NULL,
  `alamat_ktp_karyawan` varchar(255) NOT NULL,
  `no_ktp` varchar(30) NOT NULL,
  `jenkel` enum('L','P') NOT NULL,
  `kode_jabatan` varchar(10) NOT NULL,
  `date_start` date NOT NULL,
  `date_finish` date DEFAULT NULL,
  `status_karyawan` enum('Inactive','Active') NOT NULL,
  `path_photo_karyawan` varchar(255) DEFAULT NULL,
  `id_user` varchar(10) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_karyawan`),
  KEY `idx_karyawan_jabatan` (`kode_jabatan`),
  KEY `idx_karyawan_user` (`id_user`),
  KEY `idx_karyawan_branch` (`branch_id`),
  CONSTRAINT `fk_karyawan_jabatan` FOREIGN KEY (`kode_jabatan`) REFERENCES `tbl_jabatan` (`kode_jabatan`) ON UPDATE CASCADE,
  CONSTRAINT `fk_karyawan_user` FOREIGN KEY (`id_user`) REFERENCES `tbl_users` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_karyawan_branch` FOREIGN KEY (`branch_id`) REFERENCES `tbl_branch` (`branch_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_unit` (
  `id_unit` int(11) NOT NULL AUTO_INCREMENT,
  `id_floor` int(11) NOT NULL,
  `no_unit` varchar(6) NOT NULL,
  `id_unit_type` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_unit`),
  KEY `idx_unit_floor` (`id_floor`),
  KEY `idx_unit_type` (`id_unit_type`),
  KEY `idx_unit_branch` (`branch_id`),
  CONSTRAINT `fk_unit_floor` FOREIGN KEY (`id_floor`) REFERENCES `tbl_floor` (`id_floor`) ON UPDATE CASCADE,
  CONSTRAINT `fk_unit_type` FOREIGN KEY (`id_unit_type`) REFERENCES `tbl_type_unit` (`id_unit_type`) ON UPDATE CASCADE,
  CONSTRAINT `fk_unit_branch` FOREIGN KEY (`branch_id`) REFERENCES `tbl_branch` (`branch_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_type_unit_facility` (
  `id_unit_type` int(11) NOT NULL,
  `kode_facility` varchar(10) NOT NULL,
  PRIMARY KEY (`id_unit_type`, `kode_facility`),
  KEY `idx_tuf_facility` (`kode_facility`),
  CONSTRAINT `fk_tuf_unit_type` FOREIGN KEY (`id_unit_type`) REFERENCES `tbl_type_unit` (`id_unit_type`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tuf_facility` FOREIGN KEY (`kode_facility`) REFERENCES `tbl_facility` (`kode_facility`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Tabel Penyewa & Pemilik Unit
CREATE TABLE `tbl_penyewa` (
  `id_penyewa` int(11) NOT NULL AUTO_INCREMENT,
  `nama_penyewa` varchar(100) NOT NULL,
  `telepon_penyewa` varchar(100) NOT NULL,
  `alamat_domisili_penyewa` varchar(255) NOT NULL,
  `alamat_ktp_penyewa` varchar(255) NOT NULL,
  `no_ktp` varchar(30) NOT NULL,
  `jenkel` enum('L','P') NOT NULL,
  `id_unit` int(11) NOT NULL,
  `uang_muka` decimal(15,0) NOT NULL,
  `harga_unit` decimal(15,0) NOT NULL,
  `date_check_in` date NOT NULL,
  `date_check_out` date NOT NULL,
  `path_photo_penyewa` varchar(255) DEFAULT NULL,
  `id_user` varchar(10) NOT NULL,
  `status_rent` enum('available','rented','maintenance') NOT NULL,
  `bulan_sewa` int(11) NOT NULL,
  `tahun_sewa` int(11) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_penyewa`),
  KEY `idx_penyewa_unit` (`id_unit`),
  KEY `idx_penyewa_user` (`id_user`),
  KEY `idx_penyewa_bulan` (`bulan_sewa`),
  KEY `idx_penyewa_tahun` (`tahun_sewa`),
  KEY `idx_penyewa_branch` (`branch_id`),
  CONSTRAINT `fk_penyewa_unit` FOREIGN KEY (`id_unit`) REFERENCES `tbl_unit` (`id_unit`) ON UPDATE CASCADE,
  CONSTRAINT `fk_penyewa_user` FOREIGN KEY (`id_user`) REFERENCES `tbl_users` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_penyewa_bulan` FOREIGN KEY (`bulan_sewa`) REFERENCES `tbl_bulan` (`id_bulan`) ON UPDATE CASCADE,
  CONSTRAINT `fk_penyewa_tahun` FOREIGN KEY (`tahun_sewa`) REFERENCES `tbl_tahun` (`id_tahun`) ON UPDATE CASCADE,
  CONSTRAINT `fk_penyewa_branch` FOREIGN KEY (`branch_id`) REFERENCES `tbl_branch` (`branch_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_pemilik` (
  `id_pemilik` int(11) NOT NULL AUTO_INCREMENT,
  `nama_pemilik` varchar(100) NOT NULL,
  `telepon_pemilik` varchar(100) NOT NULL,
  `alamat_domisili_pemilik` varchar(255) NOT NULL,
  `alamat_ktp_pemilik` varchar(255) NOT NULL,
  `no_ktp` varchar(30) NOT NULL,
  `jenkel` enum('L','P') NOT NULL,
  `id_unit` int(11) NOT NULL,
  `path_photo_pemilik` varchar(255) DEFAULT NULL,
  `id_user` varchar(10) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pemilik`),
  KEY `idx_pemilik_unit` (`id_unit`),
  KEY `idx_pemilik_user` (`id_user`),
  KEY `idx_pemilik_branch` (`branch_id`),
  CONSTRAINT `fk_pemilik_unit` FOREIGN KEY (`id_unit`) REFERENCES `tbl_unit` (`id_unit`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pemilik_user` FOREIGN KEY (`id_user`) REFERENCES `tbl_users` (`id_user`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pemilik_branch` FOREIGN KEY (`branch_id`) REFERENCES `tbl_branch` (`branch_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;





IOT
arduiono
#include <DHT.h>
#include <ArduinoJson.h>

#define DHT_PIN 4       // Pin DATA DHT11 ke GPIO 4 (D4)
#define DHT_TYPE DHT11

DHT dht(DHT_PIN, DHT_TYPE);

unsigned long lastReadTime = 0;
const unsigned long SENSOR_INTERVAL = 2000; // Kirim data tiap 2 detik

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  unsigned long now = millis();
  if (now - lastReadTime >= SENSOR_INTERVAL) {
    lastReadTime = now;

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    JsonDocument doc;

    if (isnan(h) || isnan(t)) {
      doc["status"] = "error";
    } else {
      float hi = dht.computeHeatIndex(t, h, false);
      doc["status"] = "ok";
      doc["temperature"] = serialized(String(t, 1));
      doc["humidity"] = serialized(String(h, 1));
      doc["heat_index"] = serialized(String(hi, 1));
    }

    // Kirim data JSON satu baris lewat kabel USB ke PC
    serializeJson(doc, Serial);
    Serial.println();
  }
}

WEB------------------------------------------------------------------------------------------------------------------
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ESP32 DHT11 — EnviroMonitor USB</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {
      --bg-dark: #090b10;
      --bg-gradient: radial-gradient(circle at 15% 15%, rgba(255, 215, 0, 0.08), transparent 40%),
                     radial-gradient(circle at 85% 80%, rgba(6, 182, 212, 0.09), transparent 45%),
                     #090b10;
      --glass-bg: rgba(18, 22, 33, 0.65);
      --glass-border: rgba(255, 255, 255, 0.09);
      --gold: #ffd700;
      --gold-amber: #f59e0b;
      --cyan: #06b6d4;
      --emerald: #10b981;
      --rose: #f43f5e;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    body {
      background: var(--bg-gradient);
      background-color: var(--bg-dark);
      color: var(--text-main);
      min-height: 100vh;
      padding: 24px 16px 48px;
    }

    .container {
      max-width: 1120px;
      margin: 0 auto;
    }

    .glass {
      background: var(--glass-bg);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
    }

    .header {
      padding: 20px 24px;
      margin-bottom: 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border-color: rgba(255, 215, 0, 0.16);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-icon {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--gold), var(--gold-amber));
      color: #090b10;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 18px;
      box-shadow: 0 0 22px rgba(255, 215, 0, 0.4);
    }

    .brand h1 {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(90deg, #ffffff, var(--gold));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand p {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .btn {
      border: none;
      border-radius: 10px;
      padding: 10px 18px;
      font-size: 0.86rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.2s ease;
    }

    .btn:active {
      transform: scale(0.96);
    }

    .btn-gold {
      background: linear-gradient(135deg, var(--gold), var(--gold-amber));
      color: #090b10;
      box-shadow: 0 0 16px rgba(255, 215, 0, 0.35);
    }

    .btn-gold:hover {
      box-shadow: 0 0 24px rgba(255, 215, 0, 0.55);
    }

    .btn-outline {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
      border: 1px solid var(--glass-border);
    }

    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-danger {
      background: rgba(244, 63, 94, 0.15);
      color: #fda4af;
      border: 1px solid rgba(244, 63, 94, 0.35);
    }

    .status-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 20px;
      padding: 0 4px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--glass-border);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--gold);
      box-shadow: 0 0 10px var(--gold);
      animation: pulse 1.6s infinite;
    }

    .dot.live {
      background: var(--emerald);
      box-shadow: 0 0 10px var(--emerald);
    }

    .dot.error {
      background: var(--rose);
      box-shadow: 0 0 10px var(--rose);
      animation: none;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.45; transform: scale(0.85); }
    }

    .sim-toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.84rem;
      color: var(--text-muted);
      cursor: pointer;
    }

    .sim-toggle input {
      accent-color: var(--gold);
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 18px;
      margin-bottom: 24px;
    }

    .kpi-card {
      padding: 22px;
      position: relative;
      overflow: hidden;
    }

    .kpi-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent, var(--gold)), transparent);
    }

    .kpi-card.cyan { --accent: var(--cyan); }
    .kpi-card.emerald { --accent: var(--emerald); }

    .kpi-label {
      font-size: 0.84rem;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .kpi-tag {
      font-size: 0.72rem;
      padding: 3px 9px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-main);
    }

    .kpi-value {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 12px 0 8px;
      letter-spacing: -0.03em;
    }

    .kpi-value span {
      font-size: 1.15rem;
      font-weight: 500;
      color: var(--text-muted);
      margin-left: 4px;
    }

    .kpi-meta {
      font-size: 0.78rem;
      color: var(--text-muted);
      display: flex;
      gap: 14px;
    }

    .chart-card, .log-card {
      padding: 22px;
      margin-bottom: 24px;
    }

    .section-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }

    .section-header h2 {
      font-size: 1rem;
      font-weight: 600;
    }

    .chart-wrapper {
      position: relative;
      height: 280px;
      width: 100%;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.86rem;
      text-align: left;
    }

    th {
      color: var(--text-muted);
      font-weight: 600;
      padding: 10px 12px;
      border-bottom: 1px solid var(--glass-border);
    }

    td {
      padding: 11px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .pill {
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 600;
    }

    .pill-sim {
      background: rgba(255, 215, 0, 0.14);
      color: var(--gold);
    }

    .pill-esp {
      background: rgba(16, 185, 129, 0.15);
      color: #6ee7b7;
    }

    .error-banner {
      display: none;
      background: rgba(244, 63, 94, 0.14);
      border: 1px solid rgba(244, 63, 94, 0.35);
      color: #fecdd3;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 0.84rem;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="glass header">
      <div class="brand">
        <div class="brand-icon">USB</div>
        <div>
          <h1>ESP32 DHT11 EnviroMonitor</h1>
          <p>Monitoring Suhu &amp; Kelembaban via Kabel USB Serial</p>
        </div>
      </div>

      <div>
        <button id="usbConnectBtn" class="btn btn-gold">Hubungkan USB ESP32</button>
      </div>
    </header>

    <div class="status-bar">
      <div class="badge">
        <span id="statusDot" class="dot"></span>
        <span id="statusText">Mode Simulasi Aktif (Interval 2 detik)</span>
      </div>

      <label class="sim-toggle">
        <input type="checkbox" id="simCheckbox" checked />
        Simulasi Sensor Otomatis
      </label>
    </div>

    <div id="errorBanner" class="error-banner"></div>

    <section class="kpi-grid">
      <div class="glass kpi-card">
        <div class="kpi-label">
          <span>SUHU RUANGAN</span>
          <span id="tempStatus" class="kpi-tag">Normal</span>
        </div>
        <div class="kpi-value" id="tempVal">--.-<span>°C</span></div>
        <div class="kpi-meta">
          <span>Min: <strong id="tempMin">--</strong>°C</span>
          <span>Maks: <strong id="tempMax">--</strong>°C</span>
        </div>
      </div>

      <div class="glass kpi-card cyan">
        <div class="kpi-label">
          <span>KELEMBABAN UDARA</span>
          <span id="humStatus" class="kpi-tag">Ideal</span>
        </div>
        <div class="kpi-value" id="humVal">--.-<span>%</span></div>
        <div class="kpi-meta">
          <span>Min: <strong id="humMin">--</strong>%</span>
          <span>Maks: <strong id="humMax">--</strong>%</span>
        </div>
      </div>

      <div class="glass kpi-card emerald">
        <div class="kpi-label">
          <span>HEAT INDEX (TERASA)</span>
          <span id="hiStatus" class="kpi-tag">Nyaman</span>
        </div>
        <div class="kpi-value" id="hiVal">--.-<span>°C</span></div>
        <div class="kpi-meta">
          <span>Update terakhir: <strong id="lastUpdate">-</strong></span>
        </div>
      </div>
    </section>

    <section class="glass chart-card">
      <div class="section-header">
        <h2>Grafik Real-Time (20 Pembacaan Terakhir)</h2>
      </div>
      <div class="chart-wrapper">
        <canvas id="sensorChart"></canvas>
      </div>
    </section>

    <section class="glass log-card">
      <div class="section-header">
        <h2>Riwayat Pembacaan Sensor</h2>
        <div style="display: flex; gap: 8px;">
          <button id="exportCsvBtn" class="btn btn-outline">Unduh CSV</button>
          <button id="clearLogBtn" class="btn btn-outline">Reset Data</button>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Sumber</th>
              <th>Suhu (°C)</th>
              <th>Kelembaban (%)</th>
              <th>Heat Index (°C)</th>
            </tr>
          </thead>
          <tbody id="logTableBody"></tbody>
        </table>
      </div>
    </section>
  </div>

  <script>
    const usbConnectBtn = document.getElementById('usbConnectBtn');
    const simCheckbox = document.getElementById('simCheckbox');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const errorBanner = document.getElementById('errorBanner');

    const tempVal = document.getElementById('tempVal');
    const humVal = document.getElementById('humVal');
    const hiVal = document.getElementById('hiVal');
    const tempMinEl = document.getElementById('tempMin');
    const tempMaxEl = document.getElementById('tempMax');
    const humMinEl = document.getElementById('humMin');
    const humMaxEl = document.getElementById('humMax');
    const tempStatus = document.getElementById('tempStatus');
    const humStatus = document.getElementById('humStatus');
    const hiStatus = document.getElementById('hiStatus');
    const lastUpdate = document.getElementById('lastUpdate');
    const logTableBody = document.getElementById('logTableBody');

    let isSimulating = true;
    let simTimer = null;
    let simTemp = 28.4;
    let simHum = 63.0;

    let serialPort = null;
    let serialReader = null;
    let readableStreamClosed = null;
    let isUsbConnected = false;

    let minTemp = Infinity, maxTemp = -Infinity;
    let minHum = Infinity, maxHum = -Infinity;
    let sessionLogs = [];

    const ctx = document.getElementById('sensorChart').getContext('2d');
    const sensorChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Suhu (°C)',
            data: [],
            borderColor: '#ffd700',
            backgroundColor: 'rgba(255, 215, 0, 0.12)',
            borderWidth: 2.5,
            tension: 0.35,
            fill: true,
            pointRadius: 3,
            yAxisID: 'y'
          },
          {
            label: 'Kelembaban (%)',
            data: [],
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.10)',
            borderWidth: 2.5,
            tension: 0.35,
            fill: true,
            pointRadius: 3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: '#cbd5e1', usePointStyle: true } }
        },
        scales: {
          x: {
            ticks: { color: '#64748b', maxRotation: 0 },
            grid: { color: 'rgba(255,255,255,0.04)' }
          },
          y: {
            type: 'linear',
            position: 'left',
            ticks: { color: '#ffd700' },
            grid: { color: 'rgba(255,255,255,0.05)' },
            title: { display: true, text: 'Suhu (°C)', color: '#ffd700' }
          },
          y1: {
            type: 'linear',
            position: 'right',
            ticks: { color: '#06b6d4' },
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'Kelembaban (%)', color: '#06b6d4' }
          }
        }
      }
    });

    function computeHeatIndex(t, h) {
      if (t < 27) return t;
      return -8.78469475556 +
        1.61139411 * t +
        2.33854883889 * h +
        -0.14611605 * t * h +
        -0.012308094 * t * t +
        -0.0164248277778 * h * h +
        0.002211732 * t * t * h +
        0.00072546 * t * h * h +
        -0.000003582 * t * t * h * h;
    }

    function updateDashboard(temp, hum, hi, source) {
      const nowStr = new Date().toLocaleTimeString('id-ID');

      tempVal.innerHTML = `${temp.toFixed(1)}<span>°C</span>`;
      humVal.innerHTML = `${hum.toFixed(1)}<span>%</span>`;
      hiVal.innerHTML = `${hi.toFixed(1)}<span>°C</span>`;
      lastUpdate.textContent = nowStr;

      if (temp < minTemp) minTemp = temp;
      if (temp > maxTemp) maxTemp = temp;
      if (hum < minHum) minHum = hum;
      if (hum > maxHum) maxHum = hum;

      tempMinEl.textContent = minTemp.toFixed(1);
      tempMaxEl.textContent = maxTemp.toFixed(1);
      humMinEl.textContent = minHum.toFixed(1);
      humMaxEl.textContent = maxHum.toFixed(1);

      tempStatus.textContent = temp > 32 ? 'Panas' : temp < 22 ? 'Sejuk' : 'Normal';
      humStatus.textContent = hum > 75 ? 'Lembab' : hum < 40 ? 'Kering' : 'Ideal';
      hiStatus.textContent = hi > 33 ? 'Waspada Panas' : 'Nyaman';

      sensorChart.data.labels.push(nowStr);
      sensorChart.data.datasets[0].data.push(Number(temp.toFixed(1)));
      sensorChart.data.datasets[1].data.push(Number(hum.toFixed(1)));

      if (sensorChart.data.labels.length > 20) {
        sensorChart.data.labels.shift();
        sensorChart.data.datasets[0].data.shift();
        sensorChart.data.datasets[1].data.shift();
      }
      sensorChart.update('none');

      sessionLogs.unshift({
        time: nowStr,
        source,
        temp: temp.toFixed(1),
        hum: hum.toFixed(1),
        hi: hi.toFixed(1)
      });

      renderTable();
    }

    function renderTable() {
      logTableBody.innerHTML = sessionLogs.slice(0, 10).map(row => `
        <tr>
          <td>${row.time}</td>
          <td><span class="pill ${row.source === 'ESP32 USB' ? 'pill-esp' : 'pill-sim'}">${row.source}</span></td>
          <td><strong>${row.temp} °C</strong></td>
          <td><strong>${row.hum} %</strong></td>
          <td>${row.hi} °C</td>
        </tr>
      `).join('');
    }

    function startSimulation() {
      stopSimulation();
      errorBanner.style.display = 'none';
      statusDot.className = 'dot';
      statusText.textContent = 'Mode Simulasi Aktif (Interval 2 detik)';

      const step = () => {
        simTemp = Math.max(25.0, Math.min(32.5, simTemp + (Math.random() - 0.48) * 0.4));
        simHum = Math.max(50.0, Math.min(78.0, simHum + (Math.random() - 0.5) * 1.2));
        updateDashboard(simTemp, simHum, computeHeatIndex(simTemp, simHum), 'Simulasi');
      };

      step();
      simTimer = setInterval(step, 2000);
    }

    function stopSimulation() {
      if (simTimer) {
        clearInterval(simTimer);
        simTimer = null;
      }
    }

    async function connectUsbSerial() {
      if (!('serial' in navigator)) {
        errorBanner.style.display = 'block';
        errorBanner.textContent = 'Browser ini belum mendukung Web Serial. Gunakan Google Chrome atau Microsoft Edge.';
        return;
      }

      try {
        serialPort = await navigator.serial.requestPort();
        await serialPort.open({ baudRate: 115200 });

        stopSimulation();
        isSimulating = false;
        simCheckbox.checked = false;
        isUsbConnected = true;

        errorBanner.style.display = 'none';
        statusDot.className = 'dot live';
        statusText.textContent = 'Terhubung ke ESP32 via Kabel USB (115200 baud)';
        usbConnectBtn.textContent = 'Putuskan USB';
        usbConnectBtn.className = 'btn btn-danger';

        const textDecoder = new TextDecoderStream();
        readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
        serialReader = textDecoder.readable.getReader();

        let buffer = '';
        while (isUsbConnected) {
          const { value, done } = await serialReader.read();
          if (done) break;
          buffer += value;

          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
              try {
                const data = JSON.parse(trimmed);
                if (data.status === 'error') {
                  errorBanner.style.display = 'block';
                  errorBanner.textContent = 'ESP32 terhubung, tetapi sensor DHT11 gagal terbaca. Cek kabel pin DATA (GPIO 4), VCC (3V3), dan GND.';
                  continue;
                }

                const temp = parseFloat(data.temperature);
                const hum = parseFloat(data.humidity);
                if (!isNaN(temp) && !isNaN(hum)) {
                  errorBanner.style.display = 'none';
                  const hi = data.heat_index !== undefined
                    ? parseFloat(data.heat_index)
                    : computeHeatIndex(temp, hum);
                  updateDashboard(temp, hum, hi, 'ESP32 USB');
                }
              } catch (_) {}
            }
          }
        }
      } catch (err) {
        if (err.name !== 'NotFoundError') {
          errorBanner.style.display = 'block';
          errorBanner.textContent = `Gagal membuka port USB: ${err.message}. Pastikan Serial Monitor Arduino IDE sudah ditutup.`;
        }
        await disconnectUsbSerial();
      }
    }

    async function disconnectUsbSerial() {
      isUsbConnected = false;
      try {
        if (serialReader) {
          await serialReader.cancel();
          serialReader = null;
        }
        if (readableStreamClosed) {
          await readableStreamClosed.catch(() => {});
          readableStreamClosed = null;
        }
        if (serialPort) {
          await serialPort.close();
          serialPort = null;
        }
      } catch (_) {}

      usbConnectBtn.textContent = 'Hubungkan USB ESP32';
      usbConnectBtn.className = 'btn btn-gold';

      if (!isSimulating) {
        statusDot.className = 'dot error';
        statusText.textContent = 'Kabel USB Terputus';
      }
    }

    usbConnectBtn.addEventListener('click', () => {
      if (isUsbConnected) {
        disconnectUsbSerial();
      } else {
        connectUsbSerial();
      }
    });

    simCheckbox.addEventListener('change', async (e) => {
      isSimulating = e.target.checked;
      if (isSimulating) {
        if (isUsbConnected) await disconnectUsbSerial();
        startSimulation();
      } else {
        stopSimulation();
        if (!isUsbConnected) {
          statusDot.className = 'dot error';
          statusText.textContent = 'Simulasi Dimatikan — Klik Hubungkan USB ESP32';
        }
      }
    });

    document.getElementById('clearLogBtn').addEventListener('click', () => {
      sessionLogs = [];
      minTemp = Infinity; maxTemp = -Infinity;
      minHum = Infinity; maxHum = -Infinity;
      tempMinEl.textContent = '--'; tempMaxEl.textContent = '--';
      humMinEl.textContent = '--'; humMaxEl.textContent = '--';
      sensorChart.data.labels = [];
      sensorChart.data.datasets[0].data = [];
      sensorChart.data.datasets[1].data = [];
      sensorChart.update();
      renderTable();
    });

    document.getElementById('exportCsvBtn').addEventListener('click', () => {
      if (sessionLogs.length === 0) {
        alert('Belum ada data untuk diunduh.');
        return;
      }
      const header = 'Waktu,Sumber,Suhu (C),Kelembaban (%),Heat Index (C)\n';
      const rows = sessionLogs.map(r => `${r.time},${r.source},${r.temp},${r.hum},${r.hi}`).join('\n');
      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `esp32_dht11_usb_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });

    startSimulation();
  </script>
</body>
</html>