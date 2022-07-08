const Instance = require("../instance");

module.exports = {
  getSuratMasuk: () => {
    const instance = new Instance.SuratMasuk("sm");
    instance.registerField([instance]);
    instance.map();
    instance.order("sm.id").descending();
    return instance.sql;
  },

  addSuratMasuk: (params) => {
    const instance = new Instance.SuratMasuk("sm");
    instance.schema.field.tanggal_terimasurat = params.tanggalTerimaSurat;
    instance.schema.field.perihal_surat = params.perihalSurat;
    instance.schema.field.jenis_surat = params.jenisSurat;
    instance.schema.field.filename = params.fileName;
    instance.insert();
    return instance.sql;
  },
};
