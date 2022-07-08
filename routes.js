const Routes = require("express")();

const SuratMasukRoute = require("./src/main/suratmasuk/suratmasuk.controller");
const SuratKeluarRoute = require("./src/main/suratkeluar/suratkeluar.controller");
const UsersRoute = require("./src/main/users/users.controller");

Routes.use("/api/suratmasuk", SuratMasukRoute);
Routes.use("/api/suratkeluar", SuratKeluarRoute);
Routes.use("/api/users", UsersRoute);

module.exports = Routes;
