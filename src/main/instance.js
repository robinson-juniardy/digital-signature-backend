const Instance = require("../application/mainmodel");

class SuratMasuk extends Instance {
  constructor(alias) {
    super();
    this.alias = alias;
    this.schema = {
      name: "surat_masuk",
      field: {
        id: new Number(),
        tanggal_terimasurat: new String(),
        perihal_surat: new String(),
        filename: new String(),
        asal_surat: new String(),
        jenis_surat: new String(),
        created_time: new String(),
        created_by: new Number(),
      },
    };
  }
}

module.exports = {
  SuratMasuk,
};
