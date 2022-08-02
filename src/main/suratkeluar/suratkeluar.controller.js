const { database } = require("../../application/application");
const Controller = require("express").Router();
const Model = require("./suratkeluar.model");
const multer = require("multer");
const { filefilter, storage } = require("../../application/uploadFileSettings");
const upload = multer({ storage: storage, filefilter: filefilter });

Controller.get("/", async (request, response) => {
  const result = await database
    .execute(Model.getSuratKeluar())
    .then((response) => response)
    .catch((error) => error);
  response.json(result);
});

Controller.get("/stamp-document", async (request, response) => {
  const result = await database
    .execute(
      `SELECT (SELECT nip from users WHERE users.id = document_sign.eksekutor) AS nip_eksekutor FROM document_sign WHERE filename='${request.query.filename}'`
    )
    .then((response) => response)
    .catch((error) => error);
  response.json(result);
});

Controller.get("/temp-byid/:id", async (request, response) => {
  const result1 = await database
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
          role.role_name as status_jabatan,
          CASE WHEN sign.status_eksekusi IS NULL THEN 'Di Proses' ELSE sign.status_eksekusi
      END AS status_eksekusi,
      sign.status_level AS status_level,
      users.nama AS nama_eksekutor,
      users.jabatan AS jabatan,
      users.nip AS nip,
      CASE 
      WHEN sign.status_level > sign.level_eksekusi AND sign.status_level <= 3 THEN 'Selesai' 
      WHEN sign.status_level = sign.level_eksekusi THEN 'Di Proses' 
      WHEN sign.status_level < sign.level_eksekusi THEN 'Menunggu Paraf' 
      WHEN sign.status = 4 THEN 'Selesai'
      WHEN sign.status_level = 5 THEN 'Di Kembalikan'
      END AS eksekusi
      FROM document_sign sign
      LEFT JOIN users ON users.id = sign.eksekutor
      LEFT JOIN role on role.id = users.jabatan
      WHERE sign.eksekutor = ${request.params.id} GROUP BY sign.filename`
    )
    .then((response) => {
      return response;
    })
    .catch((error) => error);

  console.log(result1);

  const res = [];

  for (value of result1.data) {
    const detail = await database
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
            role.role_name as status_jabatan,
            CASE WHEN sign.status_eksekusi IS NULL THEN 'Di Proses' ELSE sign.status_eksekusi
        END AS status_eksekusi,
        sign.status_level AS status_level,
        users.nama AS nama_eksekutor,
        users.jabatan AS jabatan,
        users.nip AS nip,
        CASE 
        WHEN sign.status_level > sign.level_eksekusi AND sign.status_level <= 3 THEN 'Selesai' 
        WHEN sign.status_level = sign.level_eksekusi THEN 'Di Proses' 
        WHEN sign.status_level < sign.level_eksekusi THEN 'Menunggu Paraf' 
        WHEN sign.status_level = 5 THEN 'Di Kembalikan'
        WHEN sign.status = 4 THEN 'Selesai'
        END AS eksekusi
        FROM document_sign sign
        LEFT JOIN users ON users.id = sign.eksekutor
        LEFT JOIN role on role.id = users.role
        WHERE sign.filename = '${value.filename}'`
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

Controller.post("/hapus-suratkeluar", async (request, response) => {
  const result = await database
    .execute(
      `DELETE FROM document_sign WHERE filename='${request.body.filename}'`
    )
    .then((result) => result)
    .catch((error) => error);
  response.json(result);
});

Controller.post(
  "/revisi",
  upload.single("fileName"),
  async (request, response) => {
    console.log(request.body);
    const result = await database
      .execute(
        `UPDATE document_sign SET 
       status='${request.body.status}',
       status_eksekusi='${request.body.status_eksekusi}',
       status_level=${request.body.status_level},
       lastmodified_time='${new Date()}',
       alasan_revisi='${request.body.alasan_revisi}'
       WHERE filename='${request.body.old_filename}'`
      )
      .then((response) => response)
      .catch((error) => error);

    response.json(result);
  }
);

Controller.get("/temp", async (request, response) => {
  const result1 = await database
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

  const res = [];

  for (value of result1.data) {
    const detail = await database
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
            role.role_name as status_jabatan,
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
        LEFT JOIN role on role.id = users.jabatan
        WHERE sign.filename = '${value.filename}'`
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

Controller.get("/temp-status-data", async (request, response) => {
  const result = await database
    .execute(
      `SELECT filename, perihal, judul, created_time, (CASE 
      WHEN status <1 THEN 'Dikirimkan' 
      WHEN status = 1 THEN 'Diproses' 
      WHEN status IS NULL THEN 'Selesai' END) AS status 
      from surat_keluar_temp GROUP BY filename;`
    )
    .then((response) => response)
    .catch((error) => error);
  response.json(result);
});

Controller.get("/signature", async (request, response) => {
  const result = await database
    .execute(
      `SELECT id, nama, jabatan, nip, paraf, tandatangan, role FROM users WHERE role NOT IN (5,6) ORDER BY id DESC`
    )
    .then((response) => response)
    .catch((error) => error);
  response.json(result);
});

Controller.get("/sign-list/", async (request, response) => {
  const result = await database
    .execute(Model.getSignList(request.query))
    .then((response) => response)
    .catch((error) => error);
  response.json(result);
});

Controller.get("/status-sign-dokumen", async (request, response) => {
  const result = await database
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
          role.role_name as status_jabatan,
          CASE WHEN sign.status_eksekusi IS NULL THEN 'Di Proses' ELSE sign.status_eksekusi
      END AS status_eksekusi,
      sign.status_level AS status_level,
      users.nama AS nama_eksekutor,
      users.jabatan AS jabatan,
      users.nip AS nip,
      CASE WHEN sign.status_level > sign.level_eksekusi AND sign.status_level <= 3 THEN 'Selesai' 
      WHEN sign.status_level = sign.level_eksekusi THEN 'Di Proses' WHEN sign.status_level < sign.level_eksekusi 
      THEN 'Menunggu Paraf' WHEN sign.status_level = 5 THEN 'Di Kembalikan'
      END AS eksekusi
      FROM document_sign sign
      LEFT JOIN users ON users.id = sign.eksekutor
      LEFT JOIN role on role.id = users.jabatan`
    )
    .then((response) => response)
    .catch((error) => error);
  response.json(result);
});

Controller.post("/", upload.single("fileName"), async (request, response) => {
  const formData = {
    judul: request.body.judul,
    perihal: request.body.perihalSurat,
    fileName: request.file.filename,
    annot: JSON.parse(request.body.annot),
  };

  const result = await database
    .execute(Model.addSuratKeluar(formData))
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.post(
  "/sign",
  upload.single("fileName"),
  async (request, response) => {
    console.log(request.file);
    const result = await database
      .execute(
        `UPDATE document_sign SET 
       filename='${request.file.filename}',
       status='${request.body.status}',
       status_eksekusi='${request.body.status_eksekusi}',
       status_level=${
         request.body.status_level === 3 ? 3 : request.body.status_level
       },
       lastmodified_time='${new Date()}'
       WHERE filename='${request.body.old_filename}'`
      )
      .then((response) => response)
      .catch((error) => error);

    response.json(result);
  }
);

module.exports = Controller;
