const Instance = require("../instance");

module.exports = {
  getSuratKeluar: () => {
    return `SELECT * FROM surat_keluar ORDER BY id DESC`;
  },

  getSignList: (params) => {
    const sql = `SELECT * FROM document_sign WHERE eksekutor=${params.sign_id}`;
    console.log(sql);
    return sql;
  },

  addSuratKeluar: (params) => {
    const sql = `INSERT INTO document_sign(filename, atribut, annotation_field, eksekutor, level_eksekusi, status, judul, perihal, status_level) VALUES 
      ${params.annot.map(
        (value) =>
          `('${params.fileName}', '${value.type}', '${value.annotationField}', '${value.userSignature}', ${value.level}, 'Dikirimkan Ke Pemaraf Level 1', '${params.judul}', '${params.perihal}', 1)`
      )}`;
    return sql;
  },
};
