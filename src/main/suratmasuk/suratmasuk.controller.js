const { database } = require("../../application/application");
const Controller = require("express").Router();
const Model = require("./suratmasuk.model");
const multer = require("multer");
const { filefilter, storage } = require("../../application/uploadFileSettings");
const upload = multer({ storage: storage, filefilter: filefilter });
const moment = require("moment");

Controller.get("/", async (request, response) => {
  let sql = "";
  if (request.query.history === true) {
    sql = `SELECT sm.*, disposisi.*, us.nama, role.role_name, approve_users.nama as user_approve, 
       approve_role.role_name as role_approve, (SELECT nama FROM users WHERE id=disposisi.disposisi_by) AS disposisi_by_name,
       (SELECT role_name FROM role LEFT JOIN users ON users.jabatan = role.id WHERE users.id=disposisi.disposisi_by) AS disposisi_by_role
       FROM surat_masuk sm
       LEFT JOIN disposisi on disposisi.id_surat = sm.id
       LEFT JOIN users us on us.id = disposisi.disposisi_user
       LEFT JOIN role on role.id = us.jabatan
       LEFT JOIN users approve_users on approve_users.id = disposisi.approve_by
       LEFT JOIN role approve_role on approve_role.id = approve_users.jabatan
       ORDER BY sm.id DESC`;
  } else {
    sql = `SELECT sm.*, disposisi.*, us.nama, role.role_name, approve_users.nama as user_approve, 
       approve_role.role_name as role_approve, (SELECT nama FROM users WHERE id=disposisi.disposisi_by) AS disposisi_by_name,
       (SELECT role_name FROM role LEFT JOIN users ON users.jabatan = role.id WHERE users.id=disposisi.disposisi_by) AS disposisi_by_role
       FROM surat_masuk sm
       LEFT JOIN disposisi on disposisi.id_surat = sm.id
       LEFT JOIN users us on us.id = disposisi.disposisi_user
       LEFT JOIN role on role.id = us.jabatan
       LEFT JOIN users approve_users on approve_users.id = disposisi.approve_by
       LEFT JOIN role approve_role on approve_role.id = approve_users.jabatan
       WHERE disposisi.disposisi_id IS NULL AND sm.status_dokumen < 2
       ORDER BY sm.id DESC`;
  }
  const result = await database
    .execute(sql)
    .then((response) => response)
    .catch((error) => error);
  response.json(result);
});

Controller.get("/suratmasuk-dan-disposisi", async (request, response) => {
  const result1 = await database
    .execute(
      `select 
        sm.status_dokumen AS status_dokumen2, 
        sm.id AS id_surat, 
        sm.tanggal_terimasurat AS tanggal_terimasurat, 
        sm.perihal_surat AS perihal_surat, 
        sm.filename AS filename, 
        sm.jenis_surat AS jenis_surat, 
        sm.created_time AS tanggal_eksekusi, 
        sm.modified_by AS modified_by, 
        ds.disposisi_user AS disposisi_user, 
        ds.disposisi_id AS disposisi_id, 
        ds.status AS status, 
        ds.created_time AS disposisi_time, 
        ds.disposisi_by AS disposisi_by, 
        role_ud.role_name AS jabatan_diposisi, 
        role_udb.role_name AS jabatan_disposisi_by, 
        role_ud.disposision_level AS disposision_level_disposisi, 
        role_udb.disposision_level AS disposision_level_pendisposisi, 
        ud.nama AS nama_disposisi, 
        udb.nama AS nama_pendisposisi, 
        ud.nip AS nip_disposisi, 
        udb.nip AS nip_pendisposisi, 
        ds.modified_time,
        case 
          when sm.status_dokumen = 0 then 'Masuk Ke KA.OPD' 
          when sm.status_dokumen = 1 then 'Di Proses' 
          when sm.status_dokumen = 2 then 'Diposisi' 
          when sm.status_dokumen = 3 then 'Selesai Di Proses' 
          when sm.status_dokumen = 4 then 'Disposisi Proses' 
          when sm.status_dokumen = 5 then 'Disposisi Selesai' 
        end AS status_dokumen 
            from surat_masuk sm 
            left join disposisi ds on ds.id_surat = sm.id
            left join users ud on ud.id = ds.disposisi_user
            left join users udb on udb.id = ds.disposisi_by
            left join role role_ud on role_ud.id = ud.jabatan
            left join role role_udb on role_udb.id = udb.jabatan
            GROUP BY sm.id
            `
    )
    .then((response) => response)
    .catch((error) => error);

  const res = [];

  for (value of result1.data) {
    const detail = await database
      .execute(
        `select 
          sm.status_dokumen AS status_dokumen2, 
          sm.id AS id_surat, 
          sm.tanggal_terimasurat AS tanggal_terimasurat, 
          sm.perihal_surat AS perihal_surat, 
          sm.filename AS filename, 
          sm.jenis_surat AS jenis_surat, 
          sm.created_time AS tanggal_eksekusi, 
          sm.modified_by AS modified_by, 
          ds.disposisi_user AS disposisi_user, 
          ds.disposisi_id AS disposisi_id, 
          ds.status AS status, 
          ds.created_time AS disposisi_time, 
          ds.disposisi_by AS disposisi_by, 
          role_ud.role_name AS jabatan_diposisi, 
          role_udb.role_name AS jabatan_disposisi_by, 
          role_ud.disposision_level AS disposision_level_disposisi, 
          role_udb.disposision_level AS disposision_level_pendisposisi, 
          ud.nama AS nama_disposisi, 
          udb.nama AS nama_pendisposisi, 
          ud.nip AS nip_disposisi, 
          udb.nip AS nip_pendisposisi, 
          ds.dokumen_status,
          ds.modified_time,
          case 
            when sm.status_dokumen = 0 then 'Masuk Ke KA.OPD' 
            when sm.status_dokumen = 1 then 'Di Proses' 
            when sm.status_dokumen = 2 then 'Diposisi' 
            when sm.status_dokumen = 3 then 'Selesai Di Proses' 
            when sm.status_dokumen = 4 then 'Disposisi Proses' 
            when sm.status_dokumen = 5 then 'Disposisi Selesai' 
          end AS status_dokumen 
              from surat_masuk sm 
              left join disposisi ds on ds.id_surat = sm.id
              left join users ud on ud.id = ds.disposisi_user
              left join users udb on udb.id = ds.disposisi_by
              left join role role_ud on role_ud.id = ud.jabatan
              left join role role_udb on role_udb.id = udb.jabatan
          WHERE sm.id=${value.id_surat}`
      )
      .then((response) => {
        res.push({
          ...value,
          detail: response.data,
        });
        return response;
      })
      .catch((error) => error);
  }

  response.json(res);
});

Controller.get("/disposisi-proses", async (request, response) => {
  const result = await database
    .execute(
      `
      SELECT * FROM surat_masuk sm INNER JOIN disposisi ds on ds.id_surat = sm.id WHERE sm.status_dokumen = 2 AND ds.status < ${request.query.disposision_level}
  `
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.get("/disposisi-selesai", async (request, response) => {
  const result = await database
    .execute(
      `
      SELECT * FROM surat_masuk sm INNER JOIN disposisi ds on ds.id_surat = sm.id WHERE sm.status_dokumen = 5 AND ds.status < ${request.query.disposision_level}
      `
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.post("/selesai", async (request, response) => {
  if (request.body.user_role === "ka_opd") {
    const result = await database
      .execute(
        `
    UPDATE surat_masuk SET status_dokumen = ${request.body.status}, 
    modified_by='${request.body.created_by}',
    modified_time = '${moment().format()}'
    WHERE id =${request.body.id_surat}
  `
      )
      .then((response) => response)
      .catch((error) => error);

    response.json(result);
  } else {
    await database
      .execute(
        `
        UPDATE disposisi SET status = 3,
        modified_time = '${new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")}'
        WHERE disposisi_id = ${request.body.disposisi_id}
        `
      )
      .then((res) => {
        response.json(res);
      })
      .catch((error) => {
        response.json(error);
      });
  }
});

Controller.post("/proses", async (request, response) => {
  if (request.body.user_role === "ka_opd") {
    const result = await database
      .execute(
        `
    UPDATE surat_masuk SET status_dokumen = ${request.body.status}, 
    modified_by='${request.body.created_by}',
    modified_time = '${moment().format()}'
    WHERE id =${request.body.id_surat}
  `
      )
      .then((response) => response)
      .catch((error) => error);

    response.json(result);
  } else {
    await database
      .execute(
        `
        UPDATE disposisi SET status = 1,
        modified_time = '${new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")}'
        WHERE disposisi_id = ${request.body.disposisi_id}
        `
      )
      .then((res) => {
        response.json(res);
      })
      .catch((error) => {
        response.json(error);
      });
  }
});

Controller.post("/arsip", async (request, response) => {
  const result = await database
    .execute(
      `
    INSERT INTO arsip_surat (id_surat, jenis_arsip_surat, created_by)
    VALUES(${request.body.id_surat}, '${request.body.jenis_arsip}', '${request.body.created_by}')
  `
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.get("/arsip/:user_id", async (request, response) => {
  const result = await database
    .execute(
      `
    SELECT sm.*, arsip.created_time as tanggal_arsip FROM arsip_surat as arsip
    INNER JOIN surat_masuk sm on sm.id = arsip.id_surat
    WHERE arsip.created_by = '${request.params.user_id}'
  `
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.post("/approval", async (request, response) => {
  console.log(request.body);
  if (request.body.role === "ka_opd") {
    const result = await database
      .execute(
        `INSERT INTO disposisi (id_surat, status, approve, approve_by)
      VALUES(${request.body.idSurat}, ${request.body.status}, ${request.body.approve}, ${request.body.approveBy})
      `
      )
      .then((response) => response)
      .catch((error) => error);
    response.json(result);
  } else {
    const result = await database
      .execute(
        `UPDATE disposisi SET approve=${request.body.approve}, approve_by=${request.body.approveBy} WHERE id_surat=${request.body.idSurat}`
      )
      .then((response) => response)
      .catch((error) => error);
    response.json(result);
  }
});

Controller.get(
  "/suratmasuk-dan-disposisi/:user_id",
  async (request, response) => {
    const result1 = await database
      .execute(
        `select 
          sm.status_dokumen AS status_dokumen2, 
          sm.id AS id_surat, 
          sm.tanggal_terimasurat AS tanggal_terimasurat, 
          sm.perihal_surat AS perihal_surat, 
          sm.filename AS filename, 
          sm.jenis_surat AS jenis_surat, 
          sm.created_time AS tanggal_eksekusi, 
          sm.modified_by AS modified_by, 
          ds.disposisi_user AS disposisi_user, 
          ds.disposisi_id AS disposisi_id, 
          ds.status AS status, 
          ds.created_time AS disposisi_time, 
          ds.disposisi_by AS disposisi_by, 
          role_ud.role_name AS jabatan_diposisi, 
          role_udb.role_name AS jabatan_disposisi_by, 
          role_ud.disposision_level AS disposision_level_disposisi, 
          role_udb.disposision_level AS disposision_level_pendisposisi, 
          ud.nama AS nama_disposisi, 
          udb.nama AS nama_pendisposisi, 
          ud.nip AS nip_disposisi, 
          udb.nip AS nip_pendisposisi, 
          ds.dokumen_status,
          case 
            when sm.status_dokumen = 0 then 'Masuk Ke KA.OPD' 
            when sm.status_dokumen = 1 then 'Di Proses' 
            when sm.status_dokumen = 2 then 'Diposisi' 
            when sm.status_dokumen = 3 then 'Selesai Di Proses' 
            when sm.status_dokumen = 4 then 'Disposisi Proses' 
            when sm.status_dokumen = 5 then 'Disposisi Selesai' 
          end AS status_dokumen 
              from surat_masuk sm 
              left join disposisi ds on ds.id_surat = sm.id
              left join users ud on ud.id = ds.disposisi_user
              left join users udb on udb.id = ds.disposisi_by
              left join role role_ud on role_ud.id = ud.jabatan
              left join role role_udb on role_udb.id = udb.jabatan
          WHERE ds.disposisi_user=${request.params.user_id} 
          AND sm.status_dokumen < 5`
      )
      .then((response) => response)
      .catch((error) => error);

    const res = [];

    console.log(result1);

    for (value of result1.data) {
      const detail = await database
        .execute(
          `
          select 
            sm.status_dokumen AS status_dokumen2, 
            sm.id AS id_surat, 
            sm.tanggal_terimasurat AS tanggal_terimasurat, 
            sm.perihal_surat AS perihal_surat, 
            sm.filename AS filename, 
            sm.jenis_surat AS jenis_surat, 
            sm.created_time AS tanggal_eksekusi, 
            sm.modified_by AS modified_by, 
            ds.disposisi_user AS disposisi_user, 
            ds.disposisi_id AS disposisi_id, 
            ds.status AS status, 
            ds.created_time AS disposisi_time, 
            ds.disposisi_by AS disposisi_by, 
            role_ud.role_name AS jabatan_diposisi, 
            role_udb.role_name AS jabatan_disposisi_by, 
            role_ud.disposision_level AS disposision_level_disposisi, 
            role_udb.disposision_level AS disposision_level_pendisposisi, 
            ud.nama AS nama_disposisi, 
            udb.nama AS nama_pendisposisi, 
            ud.nip AS nip_disposisi, 
            udb.nip AS nip_pendisposisi, 
            ds.dokumen_status,
            case 
              when sm.status_dokumen = 0 then 'Masuk Ke KA.OPD' 
              when sm.status_dokumen = 1 then 'Di Proses' 
              when sm.status_dokumen = 2 then 'Diposisi' 
              when sm.status_dokumen = 3 then 'Selesai Di Proses' 
              when sm.status_dokumen = 4 then 'Disposisi Proses' 
              when sm.status_dokumen = 5 then 'Disposisi Selesai' 
            end AS status_dokumen 
                from surat_masuk sm 
                left join disposisi ds on ds.id_surat = sm.id
                left join users ud on ud.id = ds.disposisi_user
                left join users udb on udb.id = ds.disposisi_by
                left join role role_ud on role_ud.id = ud.jabatan
                left join role role_udb on role_udb.id = udb.jabatan 
          WHERE sm.id=${value.id_surat}`
        )
        .then((response) => {
          res.push({
            ...value,
            detail: response.data,
          });
          return response;
        })
        .catch((error) => error);
    }

    response.json(res);
  }
);

Controller.get("/disposisi/:user_id", async (request, response) => {
  const result = await database
    .execute(
      `SELECT * FROM surat_masuk sm
        INNER JOIN disposisi ds ON ds.id_surat = sm.id
        INNER JOIN users us on us.id = ds.disposisi_by
        INNER JOIN role ON role.id = us.jabatan
        WHERE ds.disposisi_user = ${request.params.user_id}
        AND sm.status_dokumen < 5
        ORDER BY sm.jenis_surat DESC
        `
    )
    .then((response) => response)
    .catch((error) => error);
  response.json(result);
});

Controller.post("/notifikasi-update-read", async (request, response) => {
  console.log(request.query);
  const result = await database
    .execute(
      `
    UPDATE notifikasi SET readmark=1 WHERE id=${request.body.id_notif}
  `
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.get("/notifikasi/:user_id", async (request, response) => {
  const result = await database
    .execute(
      `SELECT 
        (SELECT nama FROM users WHERE id=ns.from_user) AS pengirim,
        (SELECT nama FROM users WHERE id=ns.to_user) AS penerima,
        sm.status_dokumen AS status_dokumen2, 
          sm.id AS id_surat, 
          sm.tanggal_terimasurat AS tanggal_terimasurat, 
          sm.perihal_surat AS perihal_surat, 
          sm.filename AS filename, 
          sm.jenis_surat AS jenis_surat, 
          sm.created_time AS tanggal_eksekusi, 
          sm.modified_by AS modified_by, 
          ds.disposisi_user AS disposisi_user, 
          ds.disposisi_id AS disposisi_id, 
          ds.status AS status, 
          ds.created_time AS disposisi_time, 
          ds.disposisi_by AS disposisi_by, 
          role_ud.role_name AS jabatan_diposisi, 
          role_udb.role_name AS jabatan_disposisi_by, 
          role_ud.disposision_level AS disposision_level_disposisi, 
          role_udb.disposision_level AS disposision_level_pendisposisi, 
          ud.nama AS nama_disposisi, 
          udb.nama AS nama_pendisposisi, 
          ud.nip AS nip_disposisi, 
          udb.nip AS nip_pendisposisi, 
        case 
            when sm.status_dokumen = 0 then 'Masuk Ke KA.OPD' 
            when sm.status_dokumen = 1 then 'Di Proses' 
            when sm.status_dokumen = 2 then 'Diposisi' 
            when sm.status_dokumen = 3 then 'Selesai Di Proses' 
            when sm.status_dokumen = 4 then 'Disposisi Proses' 
            when sm.status_dokumen = 5 then 'Disposisi Selesai' 
          end AS status_dokumen,
        ns.*
        FROM notifikasi ns
        left join disposisi ds on ds.disposisi_id = ns.ref_id
        left join surat_masuk sm on sm.id = ds.id_surat
        left join users ud on ud.id = ds.disposisi_user
        left join users udb on udb.id = ds.disposisi_by
        left join role role_ud on role_ud.id = ud.jabatan
        left join role role_udb on role_udb.id = udb.jabatan
        WHERE ns.jenis_notifikasi = 'disposisi'
        AND ns.to_user=${request.params.user_id}
        ORDER BY ns.id DESC`
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.post("/disposisi", async (request, response) => {
  console.log(request.body);
  // if (request.body.role === "ka_opd") {
  const result = await database
    .execute(
      `INSERT INTO disposisi (id_surat, disposisi_user, status, disposisi_by, dokumen_status)
       VALUES(${request.body.idSurat}, ${request.body.disposisiUser}, ${request.body.status}, ${request.body.disposisiBy}, 'Disposisi')
       `
    )
    .then(async (response) => {
      await database.execute(
        `UPDATE disposisi SET status = 2 WHERE disposisi_id = ${request.body.disposisi_id}`
      );
      return response;
    })
    .catch((error) => error);
  response.json(result);
});

Controller.post("/", upload.single("fileName"), async (request, response) => {
  const formData = {
    tanggalTerimaSurat: request.body.tanggalTerimaSurat,
    perihalSurat: request.body.perihalSurat,
    jenisSurat: request.body.jenisSurat,
    fileName: request.file?.filename,
  };

  const result = await database
    .execute(Model.addSuratMasuk(formData))
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

module.exports = Controller;
