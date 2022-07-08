const { database } = require("../../application/application");
const Controller = require("express").Router();
// const Model = require("./users.model");
const multer = require("multer");
const { filefilter, storage } = require("../../application/uploadFileSettings");
const upload = multer({ storage: storage, filefilter: filefilter });
const cryptoJS = require("crypto-js");

Controller.post("/auth/login", async (request, response) => {
  console.log(
    `SELECT * FROM users WHERE nip = '${
      request.body.nip
    }' AND password='${cryptoJS.SHA256(request.body.password).toString()}'`
  );
  const result = await database
    .execute(
      `SELECT * FROM users WHERE nip = '${
        request.body.nip
      }' AND password='${cryptoJS.SHA256(request.body.password).toString()}'`
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.get("/list", async (request, response) => {
  const result = await database
    .execute(`SELECT id, nama, jabatan, nip, role FROM users ORDER BY id DESC`)
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.post("/create", async (request, response) => {
  console.log(request.body);
  const result = await database
    .execute(
      `INSERT INTO users (password, nama, jabatan, nip, role) 
      VALUES('${cryptoJS.SHA256(request.body.password).toString()}', '${
        request.body.nama
      }', '${request.body.jabatan.value}', '${request.body.nip}', '${
        request.body.role.value
      }')`
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

module.exports = Controller;
