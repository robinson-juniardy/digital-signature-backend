const { database } = require("../../application/application");
const Controller = require("express").Router();
// const Model = require("./users.model");
const multer = require("multer");
const { filefilter, storage } = require("../../application/uploadFileSettings");
const upload = multer({ storage: storage, filefilter: filefilter });
const cryptoJS = require("crypto-js");

Controller.post("/auth/login", async (request, response) => {
  console.log(
    `SELECT users.*, role.role_name, role.id as role_id, role.disposision_level FROM users 
     LEFT JOIN role ON role.id = users.jabatan
     WHERE nip = '${request.body.nip}' AND password='${cryptoJS
      .SHA256(request.body.password)
      .toString()}'`
  );
  const result = await database
    .execute(
      `SELECT users.*, role.role_name, role.id as role_id, role.disposision_level FROM users 
     LEFT JOIN role ON role.id = users.jabatan 
     WHERE nip = '${request.body.nip}' AND password='${cryptoJS
        .SHA256(request.body.password)
        .toString()}'`
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.get("/list", async (request, response) => {
  let sql = "";
  if (request.query.atribut) {
    sql = `SELECT users.*, role.role_name, role.id as role_id, disposision_level FROM users 
    LEFT JOIN role ON role.id = users.jabatan
    WHERE users.atribut = '${request.query.atribut}'
    ORDER BY id DESC`;
  } else {
    sql = `SELECT users.*, role.role_name, role.id as role_id, disposision_level FROM users 
    LEFT JOIN role ON role.id = users.jabatan
    ORDER BY id DESC`;
  }
  const result = await database
    .execute(sql)
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.get("/jabatan/list", async (request, response) => {
  const result = await database
    .execute(`SELECT * FROM role ORDER BY disposision_level DESC`)
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.get("/jabatan", async (request, response) => {
  const result = await database
    .execute(
      `SELECT * FROM role WHERE role_name not in('operator', 'admin') ORDER BY disposision_level DESC`
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.post("/create", async (request, response) => {
  console.log(request.body);
  const result = await database
    .execute(
      `INSERT INTO users (password, nama, jabatan, nip, role, atribut, paraf, tandatangan) 
      VALUES('${cryptoJS.SHA256(request.body.password).toString()}', '${
        request.body.nama
      }', '${request.body.jabatan.id}', '${request.body.nip}', '${
        request.body.role.value
      }', ${
        request.body.atribut !== null
          ? `'${request.body.atribut.atribut}'`
          : null
      }, ${request.body.pemaraf === true ? 1 : 0}, 
      ${request.body.penandatangan === true ? 1 : 0}
      )`
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.post("/update", async (request, response) => {
  const result = await database
    .execute(
      `update users set nama='${request.body.nama}', 
      jabatan=${request.body.jabatan.id}, 
      role='${request.body.role.value}',
      atribut=${
        request.body.atribut !== null
          ? `'${request.body.atribut.atribut}'`
          : null
      },
      paraf=${request.body.pemaraf === true ? 1 : 0},
      tandatangan=${request.body.penandatangan === true ? 1 : 0}
      WHERE nip='${request.body.nip}'`
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.get("/roles", async (request, response) => {
  const result = await database
    .execute(`SELECT * FROM role ORDER BY id DESC`)
    .then((response) => response)
    .catch((error) => error);
  response.json(result);
});

Controller.patch("/roles", async (request, response) => {
  const result = await database
    .execute(
      `UPDATE role SET role_name='${request.body.roleName}', 
  disposision_level=${request.body.disposisionLevel} WHERE id=${request.body.roleId}`
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.post("/roles", async (request, response) => {
  const result = await database
    .execute(
      `INSERT INTO role (role_name, disposision_level)
  VALUES('${request.body.roleName}', ${request.body.disposisionLevel})`
    )
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.post("/roles/delete", async (request, response) => {
  const result = await database
    .execute(`DELETE FROM role WHERE id = ${request.body.roleId}`)
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

Controller.post("/");

module.exports = Controller;
