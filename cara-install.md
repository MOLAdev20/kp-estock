# Panduan Instalasi EStock

Dokumen ini menjelaskan cara memasang dan menjalankan proyek EStock di komputer lokal.

## Teknologi yang Digunakan

- Frontend: React 19, TypeScript, Vite, dan Tailwind CSS
- Backend: Node.js, Express, dan Prisma
- Database: MySQL/MariaDB
- Package manager: npm

## Persyaratan

Pastikan perangkat sudah memiliki:

- Node.js `24.x` (direkomendasikan)
- npm
- MySQL atau MariaDB yang berjalan pada port default `3306`
- Git

Cek versi Node.js dan npm:

```bash
node --version
npm --version
```

Node.js 24 direkomendasikan karena API menjalankan Prisma Client hasil generate
berformat TypeScript secara langsung.

> Saat ini koneksi runtime API belum meneruskan `DATABASE_PORT` ke adapter
> MariaDB. Karena itu, gunakan port database default `3306`.

## 1. Ambil Source Code

Clone repository, kemudian masuk ke folder proyek:

```bash
git clone <URL_REPOSITORY>
cd estock
```

Jika source code sudah tersedia, langsung buka terminal pada folder root
`estock`.

## 2. Install Dependency

Proyek mempunyai tiga `package.json` dan belum menggunakan npm workspaces.
Install dependency pada root, API, dan client:

```bash
npm ci
npm ci --prefix api
npm ci --prefix client
```

Jika `npm ci` gagal karena lockfile berubah, gunakan:

```bash
npm install
npm install --prefix api
npm install --prefix client
```

## 3. Siapkan Database

Masuk ke MySQL/MariaDB:

```bash
mysql -u root -p
```

Buat database dan user khusus aplikasi:

```sql
CREATE DATABASE estock
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'estock_user'@'localhost'
  IDENTIFIED BY 'ganti_password_database';

GRANT ALL PRIVILEGES ON estock.* TO 'estock_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Nama database, username, dan password boleh diubah, tetapi nilainya harus sama
dengan konfigurasi pada langkah berikutnya.

## 4. Konfigurasi Environment API

Buat file `api/.env` dengan isi berikut:

```env
NODE_ENV=development
PORT=8080
CORS_ORIGIN=http://localhost:5173
AUTH_COOKIE_SECURE=false

DATABASE_URL="mysql://estock_user:ganti_password_database@localhost:3306/estock"
DATABASE_HOST=localhost
DATABASE_USER=estock_user
DATABASE_PASSWORD=ganti_password_database
DATABASE_NAME=estock
DATABASE_PORT=3306

JWT_ACCESS_SECRET=ganti_dengan_secret_access_yang_acak
JWT_REFRESH_SECRET=ganti_dengan_secret_refresh_yang_acak
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

Buat dua JWT secret yang berbeda. Salah satu cara membuatnya:

```bash
openssl rand -hex 32
openssl rand -hex 32
```

Masukkan hasil perintah pertama ke `JWT_ACCESS_SECRET` dan hasil kedua ke
`JWT_REFRESH_SECRET`.

Jika password database mengandung karakter khusus seperti `@`, `:`, `/`, atau
`#`, karakter tersebut harus di-URL-encode pada nilai `DATABASE_URL`.
`DATABASE_PASSWORD` tetap menggunakan password aslinya.

## 5. Konfigurasi Environment Client

Buat file `client/.env`:

```env
VITE_API_URL=http://localhost:8080
```

Nilai port harus sama dengan `PORT` pada `api/.env`.

## 6. Jalankan Migrasi Database

Masuk ke folder API, generate Prisma Client, lalu terapkan seluruh migrasi:

```bash
cd api
npm run generate
npx prisma migrate deploy --config prisma.config.js
cd ..
```

Perintah migrasi akan membuat tabel produk, pengguna, transaksi, supplier,
audit stok, dan stok opname.

## 7. Buat Akun Super Admin Pertama

Proyek ini belum memiliki script seed dan halaman registrasi. Buat akun awal
secara manual melalui MySQL/MariaDB:

```bash
mysql -u estock_user -p estock
```

Kemudian jalankan:

```sql
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@example.com', 'ganti_password_admin', 'super-admin');

EXIT;
```

> Implementasi aplikasi saat ini masih membandingkan password sebagai teks
> biasa. Gunakan kredensial khusus untuk lingkungan lokal dan jangan gunakan
> password pribadi.

Setelah login sebagai super admin, akun dengan role `staff` dapat dibuat dari
halaman manajemen pengguna.

## 8. Jalankan Aplikasi

Dari folder root proyek:

```bash
npm run dev
```

Perintah tersebut menjalankan:

- API Express melalui `nodemon` di `http://localhost:8080`
- Client Vite di `http://localhost:5173`

Buka:

```text
http://localhost:5173
```

Login menggunakan akun super admin yang dibuat pada langkah sebelumnya.

Untuk menghentikan aplikasi, tekan `Ctrl+C` pada terminal.

## Menjalankan API dan Client Secara Terpisah

API:

```bash
cd api
npm start
```

Client, pada terminal lain:

```bash
cd client
npm run dev
```

## Verifikasi Instalasi

Generate Prisma Client:

```bash
npm run generate --prefix api
```

Build frontend:

```bash
npm run build --prefix client
```

## Troubleshooting

### API gagal terhubung ke database

- Pastikan MySQL/MariaDB sedang berjalan.
- Pastikan database `estock` sudah dibuat.
- Pastikan `DATABASE_URL` dan variabel `DATABASE_*` menggunakan kredensial yang
  sama.
- Pastikan database menggunakan port `3306`.

### Error CORS atau login tidak menyimpan sesi

- Pastikan client dibuka melalui `http://localhost:5173`.
- Pastikan `CORS_ORIGIN=http://localhost:5173`.
- Untuk development lokal, gunakan `AUTH_COOKIE_SECURE=false`.
- Setelah mengubah `.env`, hentikan lalu jalankan ulang aplikasi.

### Port sudah digunakan

Jika port `5173` atau `8080` sedang digunakan, hentikan proses yang memakai
port tersebut. Jika mengubah port API, sesuaikan juga `VITE_API_URL`. Jika
mengubah port client, sesuaikan juga `CORS_ORIGIN`.

### Prisma Client belum tersedia

Jalankan:

```bash
cd api
npm run generate
```
