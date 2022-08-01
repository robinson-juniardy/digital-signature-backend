-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 01 Agu 2022 pada 11.54
-- Versi server: 10.4.22-MariaDB
-- Versi PHP: 7.4.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `digital_signature`
--

DELIMITER $$
--
-- Prosedur
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateStatusDisposisi` (`statusDisposisi` INT(11), `disposisiId` INT(11))  BEGIN
    UPDATE disposisi SET status = statusDisposisi WHERE disposisi_id = disposisiId;

END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `arsip_surat`
--

CREATE TABLE `arsip_surat` (
  `id` int(11) NOT NULL,
  `id_surat` int(11) NOT NULL,
  `jenis_arsip_surat` varchar(15) NOT NULL,
  `created_by` varchar(22) DEFAULT NULL,
  `created_time` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `disposisi`
--

CREATE TABLE `disposisi` (
  `id_surat` int(11) NOT NULL,
  `disposisi_id` int(11) NOT NULL,
  `disposisi_user` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `created_time` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_time` datetime DEFAULT NULL,
  `disposisi_by` int(11) DEFAULT NULL,
  `approve` bit(1) DEFAULT NULL,
  `approve_by` int(11) DEFAULT NULL,
  `reject_by` int(11) DEFAULT NULL,
  `dokumen_status` varchar(33) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `disposisi`
--

INSERT INTO `disposisi` (`id_surat`, `disposisi_id`, `disposisi_user`, `status`, `created_time`, `modified_time`, `disposisi_by`, `approve`, `approve_by`, `reject_by`, `dokumen_status`) VALUES
(25, 35, 34, 2, '2022-08-01 17:14:00', NULL, 11, NULL, NULL, NULL, 'Disposisi'),
(25, 36, 35, 0, '2022-08-01 17:15:21', NULL, 34, NULL, NULL, NULL, 'Disposisi');

--
-- Trigger `disposisi`
--
DELIMITER $$
CREATE TRIGGER `add_disposisi_update_dokumen_status` AFTER INSERT ON `disposisi` FOR EACH ROW BEGIN
	IF NEW.status = 0
    THEN
       UPDATE surat_masuk SET status_dokumen = 2 WHERE id = NEW.id_surat;
       END IF;
     
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `add_notifikasi_disposisi` AFTER INSERT ON `disposisi` FOR EACH ROW BEGIN
	INSERT INTO notifikasi(from_user, to_user, konten, jenis_notifikasi, ref_id)
    VALUES (NEW.disposisi_by, NEW.disposisi_user, 'Disposisi Terkini', 'disposisi', NEW.disposisi_id);
    
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `add_notifikasi_disposisi_update` AFTER UPDATE ON `disposisi` FOR EACH ROW BEGIN
    INSERT INTO notifikasi (from_user, to_user, konten, jenis_notifikasi, ref_id)
    VALUES(NEW.disposisi_by, NEW.disposisi_user, 'Disposisi Terkini', 'disposisi', NEW.disposisi_id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_status_dokumen` AFTER UPDATE ON `disposisi` FOR EACH ROW BEGIN
	IF NEW.status = 1 
    THEN
       UPDATE surat_masuk SET status_dokumen = 4 WHERE id = NEW.id_surat;
    ELSEIF NEW.status = 2 
    THEN
       UPDATE surat_masuk SET status_dokumen = 2 WHERE id = NEW.id_surat;
    ELSEIF NEW.status = 3 
    THEN
    	UPDATE surat_masuk SET status_dokumen = 5 WHERE id = NEW.id_surat;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `document_sign`
--

CREATE TABLE `document_sign` (
  `id_surat` int(11) NOT NULL,
  `atribut` varchar(30) NOT NULL,
  `eksekutor` int(11) NOT NULL,
  `annotation_field` varchar(100) NOT NULL,
  `level_eksekusi` int(11) NOT NULL,
  `status` varchar(30) NOT NULL,
  `created_time` datetime NOT NULL DEFAULT current_timestamp(),
  `lastmodified_time` datetime NOT NULL,
  `filename` text NOT NULL,
  `judul` text DEFAULT NULL,
  `perihal` text DEFAULT NULL,
  `status_eksekusi` varchar(33) DEFAULT NULL,
  `status_level` int(11) DEFAULT NULL,
  `alasan_revisi` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `document_sign`
--

INSERT INTO `document_sign` (`id_surat`, `atribut`, `eksekutor`, `annotation_field`, `level_eksekusi`, `status`, `created_time`, `lastmodified_time`, `filename`, `judul`, `perihal`, `status_eksekusi`, `status_level`, `alasan_revisi`) VALUES
(40, 'Pemaraf', 34, 'Pemaraf 1', 1, 'Di Kirimkan', '2022-08-01 16:57:02', '0000-00-00 00:00:00', '2022-08-01T09-01-28.193Z-2022-08-01T08-58-56.596Z-2022-08-01T08-57-02.294Z-Sample.pdf', 'tes', 'tes', 'Di Tandatangani', 3, NULL),
(41, 'Penanda Tangan', 11, 'ttd', 2, 'Di Kirimkan', '2022-08-01 16:57:02', '0000-00-00 00:00:00', '2022-08-01T09-01-28.193Z-2022-08-01T08-58-56.596Z-2022-08-01T08-57-02.294Z-Sample.pdf', 'tes', 'tes', 'Di Tandatangani', 3, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifikasi`
--

CREATE TABLE `notifikasi` (
  `id` int(11) NOT NULL,
  `to_user` int(11) NOT NULL,
  `from_user` int(11) NOT NULL,
  `konten` text NOT NULL,
  `badge` varchar(33) NOT NULL,
  `jenis_notifikasi` varchar(33) NOT NULL,
  `ref_id` int(11) NOT NULL,
  `created_time` datetime NOT NULL DEFAULT current_timestamp(),
  `readmark` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `notifikasi`
--

INSERT INTO `notifikasi` (`id`, `to_user`, `from_user`, `konten`, `badge`, `jenis_notifikasi`, `ref_id`, `created_time`, `readmark`) VALUES
(1, 12, 11, 'Disposisi Terkini', '', 'disposisi', 12, '2022-07-19 18:18:46', 1),
(2, 12, 11, 'Disposisi Terkini', '', 'disposisi', 13, '2022-07-19 19:37:40', 0),
(3, 27, 12, 'Disposisi Terkini', '', 'disposisi', 12, '2022-07-19 19:40:27', 0),
(4, 28, 11, 'Disposisi Terkini', '', 'disposisi', 14, '2022-07-20 23:22:13', 0),
(5, 27, 28, 'Disposisi Terkini', '', 'disposisi', 15, '2022-07-20 23:23:26', 0),
(6, 14, 27, 'Disposisi Terkini', '', 'disposisi', 16, '2022-07-20 23:25:05', 0),
(7, 28, 11, 'Disposisi Terkini', '', 'disposisi', 17, '2022-07-20 23:50:31', 0),
(8, 27, 28, 'Disposisi Terkini', '', 'disposisi', 18, '2022-07-21 00:00:37', 0),
(9, 28, 11, 'Disposisi Terkini', '', 'disposisi', 19, '2022-07-21 00:15:37', 0),
(10, 27, 28, 'Disposisi Terkini', '', 'disposisi', 20, '2022-07-21 00:16:22', 0),
(11, 14, 27, 'Disposisi Terkini', '', 'disposisi', 21, '2022-07-21 00:18:19', 0),
(12, 14, 27, 'Disposisi Terkini', '', 'disposisi', 21, '2022-07-21 00:20:38', 0),
(13, 14, 27, 'Disposisi Terkini', '', 'disposisi', 21, '2022-07-21 00:39:25', 0),
(14, 28, 11, 'Disposisi Terkini', '', 'disposisi', 19, '2022-07-21 00:39:51', 0),
(15, 28, 11, 'Disposisi Terkini', '', 'disposisi', 22, '2022-07-21 01:29:28', 0),
(18, 28, 11, 'Disposisi Terkini', '', 'disposisi', 25, '2022-07-21 01:40:28', 0),
(19, 27, 28, 'Disposisi Terkini', '', 'disposisi', 26, '2022-07-21 01:42:18', 0),
(20, 27, 28, 'Disposisi Terkini', '', 'disposisi', 27, '2022-07-21 01:48:08', 0),
(23, 27, 28, 'Disposisi Terkini', '', 'disposisi', 30, '2022-07-21 02:28:42', 0),
(24, 28, 11, 'Disposisi Terkini', '', 'disposisi', 25, '2022-07-21 02:28:42', 0),
(25, 27, 28, 'Disposisi Terkini', '', 'disposisi', 30, '2022-07-21 02:30:02', 0),
(26, 27, 28, 'Disposisi Terkini', '', 'disposisi', 30, '2022-07-21 02:30:15', 0),
(27, 27, 28, 'Disposisi Terkini', '', 'disposisi', 30, '2022-07-21 02:32:20', 0),
(28, 14, 27, 'Disposisi Terkini', '', 'disposisi', 31, '2022-07-21 02:33:06', 0),
(29, 27, 28, 'Disposisi Terkini', '', 'disposisi', 30, '2022-07-21 02:33:06', 0),
(30, 14, 27, 'Disposisi Terkini', '', 'disposisi', 31, '2022-07-21 02:33:48', 0),
(31, 14, 27, 'Disposisi Terkini', '', 'disposisi', 31, '2022-07-21 02:34:07', 0),
(32, 27, 28, 'Disposisi Terkini', '', 'disposisi', 30, '2022-07-21 02:51:01', 0),
(33, 14, 27, 'Disposisi Terkini', '', 'disposisi', 31, '2022-07-21 02:51:09', 0),
(34, 28, 11, 'Disposisi Terkini', '', 'disposisi', 32, '2022-07-21 09:23:33', 0),
(35, 28, 11, 'Disposisi Terkini', '', 'disposisi', 33, '2022-07-25 20:24:14', 0),
(36, 28, 11, 'Disposisi Terkini', '', 'disposisi', 33, '2022-07-25 20:27:38', 0),
(37, 28, 11, 'Disposisi Terkini', '', 'disposisi', 33, '2022-07-25 20:28:25', 0),
(38, 11, 33, 'Disposisi Terkini', '', 'disposisi', 34, '2022-08-01 15:09:35', 0),
(39, 11, 33, 'Disposisi Terkini', '', 'disposisi', 34, '2022-08-01 15:15:08', 0),
(40, 11, 33, 'Disposisi Terkini', '', 'disposisi', 34, '2022-08-01 15:15:28', 0),
(41, 34, 11, 'Disposisi Terkini', '', 'disposisi', 35, '2022-08-01 17:14:00', 0),
(42, 35, 34, 'Disposisi Terkini', '', 'disposisi', 36, '2022-08-01 17:15:21', 0),
(43, 34, 11, 'Disposisi Terkini', '', 'disposisi', 35, '2022-08-01 17:15:21', 0);

-- --------------------------------------------------------

--
-- Struktur dari tabel `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `role_name` varchar(255) NOT NULL,
  `disposision_level` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `role`
--

INSERT INTO `role` (`id`, `role_name`, `disposision_level`) VALUES
(1, 'KA.OPD', 4),
(2, 'ESELON 3', 3),
(3, 'ESELON 4', 2),
(4, 'STAFF', 1),
(5, 'ADMIN', NULL),
(6, 'OPERATOR', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `setup_users_privileges`
--

CREATE TABLE `setup_users_privileges` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `atribut` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `statussigndokumen`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `statussigndokumen` (
`alasan_revisi` text
,`id_surat` int(11)
,`atribut` varchar(30)
,`eksekutor` int(11)
,`annotation_field` varchar(100)
,`level_eksekusi` int(11)
,`status` varchar(30)
,`created_time` datetime
,`lastmodified_time` datetime
,`filename` text
,`judul` text
,`perihal` text
,`status_eksekusi` varchar(33)
,`status_level` int(11)
,`nama_eksekutor` text
,`jabatan` text
,`nip` varchar(21)
,`eksekusi` varchar(14)
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `surat_keluar`
--

CREATE TABLE `surat_keluar` (
  `id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `judul` text NOT NULL,
  `tanggal_upload` datetime NOT NULL DEFAULT current_timestamp(),
  `perihal` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `surat_keluar_temp`
--

CREATE TABLE `surat_keluar_temp` (
  `id` int(11) NOT NULL,
  `filename` text NOT NULL,
  `sign_type` varchar(28) NOT NULL,
  `field_annotation` varchar(55) NOT NULL,
  `users_sign` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `judul` varchar(250) NOT NULL,
  `perihal` varchar(250) NOT NULL,
  `created_time` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `surat_keluar_temp`
--

INSERT INTO `surat_keluar_temp` (`id`, `filename`, `sign_type`, `field_annotation`, `users_sign`, `status`, `judul`, `perihal`, `created_time`) VALUES
(13, '2022-07-09T13-37-44.930Z-2022-07-09T13-12-33.104Z-Instructions-for-Adding-Your-Logo-2.pdf', 'prf', 'Pemaraf', 13, 1, 'Sample Data Sign PDF', 'Sample Data', '2022-07-09 21:12:33'),
(14, '2022-07-09T13-37-44.930Z-2022-07-09T13-12-33.104Z-Instructions-for-Adding-Your-Logo-2.pdf', 'ttd', 'Tanda Tangan', 12, 1, 'Sample Data Sign PDF', 'Sample Data', '2022-07-09 21:12:33'),
(15, '2022-07-11T06-02-54.213Z-Instructions-for-Adding-Your-Logo-2.pdf', 'ttd', 'Tanda Tangan', 11, 0, 'Instructions', 'Instruksi', '2022-07-11 14:02:54'),
(16, '2022-07-11T06-02-54.213Z-Instructions-for-Adding-Your-Logo-2.pdf', 'prf', 'Paraf', 17, 0, 'Instructions', 'Instruksi', '2022-07-11 14:02:54'),
(17, '2022-07-12T14-41-27.058Z-2022-07-12T14-40-16.208Z-2022-07-12T14-39-20.672Z-pdf-sample.pdf', 'ttd', 'Tanda Tangan', 11, 1, 'Pembuatan Gedung', '-', '2022-07-12 22:39:20'),
(18, '2022-07-12T14-41-27.058Z-2022-07-12T14-40-16.208Z-2022-07-12T14-39-20.672Z-pdf-sample.pdf', 'prf', 'Paraf', 13, 1, 'Pembuatan Gedung', '-', '2022-07-12 22:39:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `surat_masuk`
--

CREATE TABLE `surat_masuk` (
  `id` int(11) NOT NULL,
  `tanggal_terimasurat` datetime DEFAULT NULL,
  `perihal_surat` text DEFAULT NULL,
  `filename` text DEFAULT NULL,
  `jenis_surat` varchar(18) DEFAULT NULL,
  `created_time` datetime NOT NULL DEFAULT current_timestamp(),
  `status_dokumen` int(11) DEFAULT 0,
  `modified_by` varchar(22) DEFAULT NULL,
  `modified_time` datetime DEFAULT NULL,
  `asal_surat` text DEFAULT NULL,
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `surat_masuk`
--

INSERT INTO `surat_masuk` (`id`, `tanggal_terimasurat`, `perihal_surat`, `filename`, `jenis_surat`, `created_time`, `status_dokumen`, `modified_by`, `modified_time`, `asal_surat`, `created_by`) VALUES
(25, '2022-08-01 00:00:00', 'Testing 3', '2022-08-01T09-12-00.962Z-Sample.pdf', 'Penting', '2022-08-01 17:12:00', 2, NULL, NULL, 'Dinas Kominfo', 15);

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `surat_masuk_dan_disposisi`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `surat_masuk_dan_disposisi` (
`status_dokumen2` int(11)
,`id_surat` int(11)
,`tanggal_terimasurat` datetime
,`perihal_surat` text
,`filename` text
,`jenis_surat` varchar(18)
,`tanggal_eksekusi` datetime
,`modified_by` varchar(22)
,`disposisi_user` int(11)
,`disposisi_id` int(11)
,`status` int(11)
,`disposisi_time` datetime
,`disposisi_by` int(11)
,`jabatan_diposisi` varchar(255)
,`jabatan_disposisi_by` varchar(255)
,`disposision_level_disposisi` int(11)
,`disposision_level_pendisposisi` int(11)
,`nama_disposisi` text
,`nama_pendisposisi` text
,`nip_disposisi` varchar(21)
,`nip_pendisposisi` varchar(21)
,`status_dokumen` varchar(17)
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `trans_surat`
--

CREATE TABLE `trans_surat` (
  `id_surat` int(11) NOT NULL,
  `filename` text NOT NULL,
  `perihal_surat` text NOT NULL,
  `judul_surat` text NOT NULL,
  `kategori_surat` varchar(10) NOT NULL,
  `jenis_surat` varchar(15) NOT NULL,
  `created_by` varchar(33) NOT NULL,
  `lastmodified_by` varchar(33) DEFAULT NULL,
  `created_time` datetime NOT NULL DEFAULT current_timestamp(),
  `lastmodified_time` datetime DEFAULT NULL,
  `status_surat` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama` text NOT NULL,
  `jabatan` text DEFAULT NULL,
  `nip` varchar(21) NOT NULL,
  `role` int(11) DEFAULT NULL,
  `atribut` varchar(33) DEFAULT NULL,
  `paraf` int(11) NOT NULL DEFAULT 0,
  `tandatangan` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `password`, `nama`, `jabatan`, `nip`, `role`, `atribut`, `paraf`, `tandatangan`) VALUES
(11, '1nd0n3s1a', 'Robinson Juniardy', NULL, '170120', 1, 'Penanda Tangan', 1, 1),
(15, '1234', 'Miyadin Nasri', NULL, '170125', 5, NULL, 0, 0),
(16, '1nd0n3s1a', 'Anto', NULL, '170126', 6, NULL, 0, 0),
(34, '1234', 'Supriyadi', 'KABID Keuangan', '170121', 2, NULL, 1, 1),
(35, '1234', 'Aristya Hiswara', 'Kepegawaian', '170122', 3, NULL, 1, 0);

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_atribut`
--

CREATE TABLE `user_atribut` (
  `id_user_atribut` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `atribut` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Struktur untuk view `statussigndokumen`
--
DROP TABLE IF EXISTS `statussigndokumen`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `statussigndokumen`  AS SELECT `sign`.`alasan_revisi` AS `alasan_revisi`, `sign`.`id_surat` AS `id_surat`, `sign`.`atribut` AS `atribut`, `sign`.`eksekutor` AS `eksekutor`, `sign`.`annotation_field` AS `annotation_field`, `sign`.`level_eksekusi` AS `level_eksekusi`, `sign`.`status` AS `status`, `sign`.`created_time` AS `created_time`, `sign`.`lastmodified_time` AS `lastmodified_time`, `sign`.`filename` AS `filename`, `sign`.`judul` AS `judul`, `sign`.`perihal` AS `perihal`, CASE WHEN `sign`.`status_eksekusi` is null THEN 'Di Proses' ELSE `sign`.`status_eksekusi` END AS `status_eksekusi`, `sign`.`status_level` AS `status_level`, `users`.`nama` AS `nama_eksekutor`, `users`.`jabatan` AS `jabatan`, `users`.`nip` AS `nip`, CASE WHEN `sign`.`status_level` > `sign`.`level_eksekusi` AND `sign`.`status_level` <= 3 THEN 'Selesai' WHEN `sign`.`status_level` = `sign`.`level_eksekusi` THEN 'Di Proses' WHEN `sign`.`status_level` < `sign`.`level_eksekusi` THEN 'Menunggu Paraf' WHEN `sign`.`status_level` = 5 THEN 'Di Kembalikan' END AS `eksekusi` FROM (`document_sign` `sign` left join `users` on(`users`.`id` = `sign`.`eksekutor`)) ;

-- --------------------------------------------------------

--
-- Struktur untuk view `surat_masuk_dan_disposisi`
--
DROP TABLE IF EXISTS `surat_masuk_dan_disposisi`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `surat_masuk_dan_disposisi`  AS SELECT `sm`.`status_dokumen` AS `status_dokumen2`, `sm`.`id` AS `id_surat`, `sm`.`tanggal_terimasurat` AS `tanggal_terimasurat`, `sm`.`perihal_surat` AS `perihal_surat`, `sm`.`filename` AS `filename`, `sm`.`jenis_surat` AS `jenis_surat`, `sm`.`created_time` AS `tanggal_eksekusi`, `sm`.`modified_by` AS `modified_by`, `ds`.`disposisi_user` AS `disposisi_user`, `ds`.`disposisi_id` AS `disposisi_id`, `ds`.`status` AS `status`, `ds`.`created_time` AS `disposisi_time`, `ds`.`disposisi_by` AS `disposisi_by`, `role_ud`.`role_name` AS `jabatan_diposisi`, `role_udb`.`role_name` AS `jabatan_disposisi_by`, `role_ud`.`disposision_level` AS `disposision_level_disposisi`, `role_udb`.`disposision_level` AS `disposision_level_pendisposisi`, `ud`.`nama` AS `nama_disposisi`, `udb`.`nama` AS `nama_pendisposisi`, `ud`.`nip` AS `nip_disposisi`, `udb`.`nip` AS `nip_pendisposisi`, CASE WHEN `sm`.`status_dokumen` = 0 THEN 'Masuk Ke KA.OPD' WHEN `sm`.`status_dokumen` = 1 THEN 'Di Proses' WHEN `sm`.`status_dokumen` = 2 THEN 'Diposisi' WHEN `sm`.`status_dokumen` = 3 THEN 'Selesai Di Proses' WHEN `sm`.`status_dokumen` = 4 THEN 'Disposisi Proses' WHEN `sm`.`status_dokumen` = 5 THEN 'Disposisi Selesai' END AS `status_dokumen` FROM (((((`surat_masuk` `sm` left join `disposisi` `ds` on(`ds`.`id_surat` = `sm`.`id`)) left join `users` `ud` on(`ud`.`id` = `ds`.`disposisi_user`)) left join `users` `udb` on(`udb`.`id` = `ds`.`disposisi_by`)) left join `role` `role_ud` on(`role_ud`.`id` = `ud`.`jabatan`)) left join `role` `role_udb` on(`role_udb`.`id` = `udb`.`jabatan`)) ;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `arsip_surat`
--
ALTER TABLE `arsip_surat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_surat` (`id_surat`);

--
-- Indeks untuk tabel `disposisi`
--
ALTER TABLE `disposisi`
  ADD PRIMARY KEY (`disposisi_id`),
  ADD KEY `id_surat` (`id_surat`);

--
-- Indeks untuk tabel `document_sign`
--
ALTER TABLE `document_sign`
  ADD PRIMARY KEY (`id_surat`),
  ADD KEY `eksekutor` (`eksekutor`);

--
-- Indeks untuk tabel `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `setup_users_privileges`
--
ALTER TABLE `setup_users_privileges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `surat_keluar`
--
ALTER TABLE `surat_keluar`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `surat_keluar_temp`
--
ALTER TABLE `surat_keluar_temp`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `surat_masuk`
--
ALTER TABLE `surat_masuk`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `trans_surat`
--
ALTER TABLE `trans_surat`
  ADD PRIMARY KEY (`id_surat`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`);

--
-- Indeks untuk tabel `user_atribut`
--
ALTER TABLE `user_atribut`
  ADD PRIMARY KEY (`id_user_atribut`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `arsip_surat`
--
ALTER TABLE `arsip_surat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1370;

--
-- AUTO_INCREMENT untuk tabel `disposisi`
--
ALTER TABLE `disposisi`
  MODIFY `disposisi_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT untuk tabel `document_sign`
--
ALTER TABLE `document_sign`
  MODIFY `id_surat` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT untuk tabel `notifikasi`
--
ALTER TABLE `notifikasi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT untuk tabel `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `setup_users_privileges`
--
ALTER TABLE `setup_users_privileges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `surat_keluar`
--
ALTER TABLE `surat_keluar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `surat_keluar_temp`
--
ALTER TABLE `surat_keluar_temp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT untuk tabel `surat_masuk`
--
ALTER TABLE `surat_masuk`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT untuk tabel `trans_surat`
--
ALTER TABLE `trans_surat`
  MODIFY `id_surat` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT untuk tabel `user_atribut`
--
ALTER TABLE `user_atribut`
  MODIFY `id_user_atribut` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `arsip_surat`
--
ALTER TABLE `arsip_surat`
  ADD CONSTRAINT `arsip_surat_ibfk_1` FOREIGN KEY (`id_surat`) REFERENCES `surat_masuk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `disposisi`
--
ALTER TABLE `disposisi`
  ADD CONSTRAINT `disposisi_ibfk_1` FOREIGN KEY (`id_surat`) REFERENCES `surat_masuk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `document_sign`
--
ALTER TABLE `document_sign`
  ADD CONSTRAINT `document_sign_ibfk_2` FOREIGN KEY (`eksekutor`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `setup_users_privileges`
--
ALTER TABLE `setup_users_privileges`
  ADD CONSTRAINT `setup_users_privileges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_atribut`
--
ALTER TABLE `user_atribut`
  ADD CONSTRAINT `user_atribut_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
