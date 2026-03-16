# Aplikasi Manajemen Stok Opname

Aplikasi ini adalah sistem manajemen stok opname berbasis web untuk mencatat, memantau, dan melakukan pencocokan data persediaan barang di gudang/toko. Dibangun dengan stack React, Tailwind CSS, Express (TypeScript), dan MySQL.

Proyek ini dibuat untuk memenuhi kebutuhan kegiatan **Kerja Praktek Universitas Pamulang Semester 6**.

## Tujuan

- Mempermudah proses pencatatan dan pembaruan data stok barang.
- Menyediakan laporan stok opname yang akurat dan terstruktur.
- Mengurangi selisih stok antara data sistem dan kondisi fisik.

## Fitur Dasar

- Autentikasi pengguna (admin dan petugas).
- Manajemen data barang (tambah, ubah, hapus, dan cari).
- Manajemen kategori dan satuan barang.
- Pencatatan stok masuk dan stok keluar.
- Stok opname (rekonsiliasi stok fisik vs sistem).
- Riwayat perubahan stok dan audit trail.
- Laporan stok dan rekap opname per periode.
- Ekspor laporan (CSV/Excel).

## Teknologi

- Frontend: React + Tailwind CSS
- Backend: Express + TypeScript
- Database: MySQL

## Struktur Proyek

- `client/` untuk aplikasi frontend (React)
- `api/` untuk server backend (Express + TypeScript)

## Cara Menjalankan (Ringkas)

1. Install dependency:
   - `npm install`
2. Jalankan backend:
   - `npm run dev` (di folder `api/`)
3. Jalankan frontend:
   - `npm run dev` (di folder `client/`)
4. Konfigurasi database MySQL di file `.env` backend.

## Lisensi

Proyek ini dibuat untuk keperluan akademik dan dapat dikembangkan lebih lanjut sesuai kebutuhan.
