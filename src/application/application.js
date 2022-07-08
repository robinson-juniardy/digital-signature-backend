const { connection } = require("../config/config");

module.exports = {
  database: {
    execute: (sqlparams, createMessage = null) => {
      return new Promise((resolve, reject) => {
        connection.query(sqlparams, (error, result, fields) => {
          if (error) {
            reject({
              status: 0,
              message: error,
              data: [],
            });
          }

          resolve({
            status: 1,
            message: createMessage !== null ? createMessage : "success",
            data: result,
          });
        });
      });
    },
  },
};
