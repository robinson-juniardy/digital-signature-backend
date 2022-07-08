const Instance = require("../instance");

module.exports = {
  getSuratKeluar: () => {
    return `SELECT * FROM surat_keluar ORDER BY id DESC`;
  },

  getSignList: (params) => {
    return `SELECT * FROM surat_keluar_temp WHERE users_sign=${params.sign_id}`;
  },

  addSuratKeluar: (params) => {
    const sql = `INSERT INTO surat_keluar_temp (filename, sign_type, field_annotation, users_sign, status, judul, perihal) VALUES 
      ${params.annot.map(
        (value) =>
          `('${params.fileName}', '${value.type}', '${value.annotationField}', '${value.userSignature}', 0, '${params.judul}', '${params.perihal}')`
      )}`;
    return sql;
  },
};
