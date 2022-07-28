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
      `INSERT INTO users (password, nama, jabatan, nip, role, atribut) 
      VALUES('${cryptoJS.SHA256(request.body.password).toString()}', '${request.body.nama
      }', '${request.body.jabatan.id}', '${request.body.nip}', '${request.body.role.value
      }', ${request.body.atribut !== null
        ? `'${request.body.atribut.atribut}'`
        : null
      })`
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
      atribut=${request.body.atribut !== null
        ? `'${request.body.atribut.atribut}'`
        : null
      }
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
  const roleName = request.body.roleName;
  const disposisionLevel = request.body.disposisionLevel;

  var errorList = [];

  if (!roleName) {
    errorList.push("Role name required");
  }

  if (!disposisionLevel) {
    errorList.push("Disposision level required");
  } else {
    if (disposisionLevel < 0) {
      errorList.push("Disposision level must be more than 1");
    }
  }

  if (errorList.length > 0) {
    return response.json({
      status: 0,
      message: errorList.join(", ")
    });
  } else {
    const queryGetRolesExist = `SELECT * FROM role WHERE role_name = '${roleName}' OR disposision_level = ${disposisionLevel}`;

    await database.execute(queryGetRolesExist).then(async (resultGetRolesExist) => {
      if (resultGetRolesExist.data.length > 0) {
        return response.json({
          status: 0,
          message: `Data dengan role name = ${roleName} atau disposision level = ${disposisionLevel} sudah ada !`
        });
      } else {
        const result = await database
          .execute(
            `INSERT INTO role (role_name, disposision_level) VALUES('${request.body.roleName}', ${request.body.disposisionLevel})`
          )
          .then((response) => response)
          .catch((error) => error);

        return response.json(result);
      }
    }).catch(errorGetRolesExist => {
      return response.json({
        status: 0,
        message: "Get Roles Exist Failed",
        error: errorGetRolesExist,
        error2: errorGetRolesExist.stack
      });
    });
  }
});

Controller.put("/roles", async (request, response) => {
  const idRoles = request.body.id;
  const roleName = request.body.role_name;
  const disposisionLevel = request.body.disposision_level;

  var errorList = [];

  if (!idRoles) {
    errorList.push("ID Role Required");
  }

  if (!roleName) {
    errorList.push("Role name required");
  }

  if (!disposisionLevel) {
    errorList.push("Disposision level required");
  } else {
    if (disposisionLevel < 0) {
      errorList.push("Disposision level must be more than 1");
    }
  }

  if (errorList.length > 0) {
    return response.json({
      status: 0,
      message: errorList.join(", ")
    });
  } else {
    const queryGetRolesExist = `SELECT * FROM role WHERE id = '${idRoles}'`;

    await database.execute(queryGetRolesExist).then(async (resultGetRolesExist) => {
      if (resultGetRolesExist.data.length > 0) {
        const queryGetRolesExist2 = `SELECT * FROM role WHERE id != ${idRoles} AND (role_name = '${roleName}' OR disposision_level = ${disposisionLevel})`;

        await database.execute(queryGetRolesExist2).then(async (resultGetRolesExist2) => {
          if (resultGetRolesExist2.data.length > 0) {
            return response.json({
              status: 0,
              message: `Data dengan role name = ${roleName} atau disposision level = ${disposisionLevel} sudah ada !`
            });
          } else {
            const queryUpdateRole = `UPDATE role SET role_name = '${roleName}', disposision_level = ${disposisionLevel} WHERE id = ${idRoles}`;
            const result = await database
              .execute(queryUpdateRole)
              .then((response) => response)
              .catch((error) => error);

            return response.json(result);
          }
        }).catch(errorGetRolesExist => {
          return response.json({
            status: 0,
            message: "Get Roles Exist 2 Failed",
            error: errorGetRolesExist,
            error2: errorGetRolesExist.stack
          });
        });
      } else {
        return response.json({
          status: 0,
          message: "Data tidak ditemukan"
        });
      }
    }).catch(errorGetRolesExist => {
      return response.json({
        status: 0,
        message: "Get Roles Exist Failed",
        error: errorGetRolesExist,
        error2: errorGetRolesExist.stack
      });
    });
  }
});

Controller.delete("/roles", async (request, response) => {
  const idRoles = request.body.id_roles;

  var errorList = [];

  if (!idRoles) {
    errorList.push("ID Role Required");
  }

  if (errorList.length > 0) {
    return response.json({
      status: 0,
      message: errorList.join(", ")
    });
  } else {
    const queryGetRolesExist = `SELECT * FROM role WHERE id = '${idRoles}'`;

    await database.execute(queryGetRolesExist).then(async (resultGetRolesExist) => {
      if (resultGetRolesExist.data.length > 0) {
        const queryDeleteRole = `DELETE FROM role WHERE id = ${idRoles}`;
        const result = await database
          .execute(queryDeleteRole)
          .then((response) => response)
          .catch((error) => error);

        return response.json(result);
      } else {
        return response.json({
          status: 0,
          message: "Data tidak ditemukan"
        });
      }
    }).catch(errorGetRolesExist => {
      return response.json({
        status: 0,
        message: "Get Roles Exist Failed",
        error: errorGetRolesExist,
        error2: errorGetRolesExist.stack
      });
    });
  }
});

Controller.post("/roles/delete", async (request, response) => {
  const result = await database
    .execute(`DELETE FROM role WHERE id = ${request.body.roleId}`)
    .then((response) => response)
    .catch((error) => error);

  response.json(result);
});

module.exports = Controller;
