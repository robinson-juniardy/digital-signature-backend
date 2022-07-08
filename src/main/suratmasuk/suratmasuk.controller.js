const { database } = require("../../application/application");
const Controller = require("express").Router();
const Model = require("./suratmasuk.model");
const multer = require("multer");
const { filefilter, storage } = require("../../application/uploadFileSettings");
const upload = multer({ storage: storage, filefilter: filefilter });

Controller.get("/", async (request, response) => {
  const result = await database
    .execute(Model.getSuratMasuk())
    .then((response) => response)
    .catch((error) => error);
  response.json(result);
});

Controller.post("/", upload.single("fileName"), async (request, response) => {
  const formData = {
    tanggalTerimaSurat: request.body.tanggalTerimaSurat,
    perihalSurat: request.body.perihalSurat,
    jenisSurat: request.body.jenisSurat,
    fileName: request.file.filename,
  };

  const result = await database
    .execute(Model.addSuratMasuk(formData))
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

module.exports = Controller;
