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

Controller.get("/signature", async (request, response) => {
  const result = await database
    .execute(
      `SELECT id, nama, jabatan, nip, role FROM users WHERE role NOT IN ('operator','admin') ORDER BY id DESC`
    )
    .then((response) => response)
    .catch((error) => error);
  response.json(result);
});

Controller.get("/sign-list/:sign_id", async (request, response) => {
  const result = await database
    .execute(Model.getSignList(request.params))
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
    console.log(request.body);
    const result = await database
      .execute(
        `UPDATE surat_keluar_temp SET filename='${request.file.filename}', 
       status=${request.body.status} WHERE filename='${request.body.old_filename}'`
      )
      .then((response) => response)
      .catch((error) => error);

    response.json(result);
  }
);

module.exports = Controller;
