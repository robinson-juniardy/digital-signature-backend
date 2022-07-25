const { database } = require("../../application/application");
const Controller = require("express").Router();

Controller.get("/", async (request, response) => {
  const suratkeluar = await database
    .execute(
      `SELECT count(*) as total FROM surat_keluar_temp GROUP BY filename`
    )
    .then((response) => {
      return response;
    })
    .catch((error) => error);
  const suratmasuk = await database
    .execute(`SELECT COUNT(*) AS total FROM surat_masuk`)
    .then((response) => {
      return response;
    })
    .catch((error) => error);

  const suratmasuk_kemarin = await database
    .execute(
      `SELECT COUNT(*) AS total FROM surat_masuk WHERE DATE(created_time) = (SELECT DATE(DATE_SUB(CURDATE(), INTERVAL 1 DAY_HOUR)))`
    )
    .then((response) => {
      return response;
    })
    .catch((error) => error);

  const suratkeluar_kemarin = await database
    .execute(
      `SELECT COUNT(*) AS total FROM document_sign WHERE DATE(created_time) = (SELECT DATE(DATE_SUB(CURDATE(), INTERVAL 1 DAY_HOUR)))
      group by filename
      `
    )
    .then((response) => {
      return response;
    })
    .catch((error) => error);

  const suratkeluar_hariini = await database
    .execute(
      `SELECT COUNT(*) AS total FROM document_sign WHERE DATE(created_time) = DATE(CURDATE())
      group by filename
      `
    )
    .then((response) => {
      return response;
    })
    .catch((error) => error);

  const suratmasuk_hariini = await database
    .execute(
      `SELECT COUNT(*) AS total FROM surat_masuk WHERE DATE(created_time) = DATE(CURDATE())`
    )
    .then((response) => {
      return response;
    })
    .catch((error) => error);

  const disposisi_selesai = await database
    .execute(
      `SELECT COUNT(*) AS total from surat_masuk WHERE status_dokumen = 5`
    )
    .then((response) => {
      return response;
    })
    .catch((error) => error);

  const selesai = await database
    .execute(
      `SELECT COUNT(*) AS total from surat_masuk WHERE status_dokumen = 3`
    )
    .then((response) => {
      return response;
    })
    .catch((error) => error);
  const disposisi_proses = await database
    .execute(`SELECT count(*) as total from disposisi WHERE status = 1`)
    .then((response) => {
      return response;
    })
    .catch((error) => error);
  const disposisi = await database
    .execute(
      `SELECT count(*) as total from surat_masuk WHERE status_dokumen = 2`
    )
    .then((response) => {
      return response;
    })
    .catch((error) => error);
  const tidak_disposisi = await database
    .execute(
      `SELECT id from surat_masuk
      LEFT JOIN disposisi ON disposisi.id_surat = surat_masuk.id
      WHERE disposisi_user is null and approve is not null`
    )
    .then((response) => {
      return response;
    })
    .catch((error) => error);
  const belum_diproses = await database
    .execute(
      `SELECT count(*) as total from surat_masuk WHERE status_dokumen = 0`
    )
    .then((response) => {
      return response;
    })
    .catch((error) => error);

  const disposisi_belum_proses = await database
    .execute(`SELECT count(*) as total from disposisi WHERE status = 0`)
    .then((response) => {
      return response;
    })
    .catch((error) => error);

  const suratkeluar_temp = await database
    .execute(
      `SELECT
          sign.alasan_revisi AS alasan_revisi,
          sign.id_surat AS id_surat,
          sign.atribut AS atribut,
          sign.eksekutor AS eksekutor,
          sign.annotation_field AS annotation_field,
          sign.level_eksekusi AS level_eksekusi,
          sign.status AS status,
          sign.created_time AS created_time,
          sign.lastmodified_time AS lastmodified_time,
          sign.filename AS filename,
          sign.judul AS judul,
          sign.perihal AS perihal,
          CASE WHEN sign.status_eksekusi IS NULL THEN 'Di Proses' ELSE sign.status_eksekusi
      END AS status_eksekusi,
      sign.status_level AS status_level,
      users.nama AS nama_eksekutor,
      users.jabatan AS jabatan,
      users.nip AS nip,
      CASE WHEN sign.status_level > sign.level_eksekusi AND sign.status_level <= 3 THEN 'Selesai' WHEN sign.status_level = sign.level_eksekusi THEN 'Di Proses' WHEN sign.status_level < sign.level_eksekusi THEN 'Menunggu Paraf' WHEN sign.status_level = 5 THEN 'Di Kembalikan'
      END AS eksekusi
      FROM document_sign sign
      LEFT JOIN users ON users.id = sign.eksekutor
      GROUP BY sign.filename`
    )
    .then((response) => {
      return response;
    })
    .catch((error) => error);

  response.json({
    suratmasuk: suratmasuk.data?.[0]?.total,
    suratkeluar: suratkeluar_temp.data.length,
    disposisi_selesai: disposisi_selesai.data?.[0]?.total,
    disposisi_proses: disposisi_proses.data?.[0]?.total,
    tidak_disposisi: tidak_disposisi.data?.[0]?.total,
    belum_diproses: belum_diproses.data?.[0]?.total,
    disposisi: disposisi.data?.[0]?.total,
    selesai: selesai.data?.[0]?.total,
    disposisi_belum_proses: disposisi_belum_proses.data?.[0]?.total,
    suratkeluar_ttd: suratkeluar_temp.data.filter(
      (item) => item.status_eksekusi === "Di Tandatangani"
    ).length,
    suratkeluar_dikembalikan: suratkeluar_temp.data.filter(
      (item) => item.status_eksekusi === "Di Kembalikan"
    ).length,
    suratmasuk_kemarin: suratmasuk_kemarin.data?.[0]?.total,
    suratmasuk_hariini: suratmasuk_hariini.data?.[0]?.total,
    suratkeluar_hariini: suratkeluar_hariini.data?.[0]?.total,
    suratkeluar_kemarin: suratkeluar_kemarin.data?.[0]?.total,
  });
});

module.exports = Controller;
