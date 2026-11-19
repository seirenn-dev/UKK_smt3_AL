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