const Routes = require("express")();

const SuratMasukRoute = require("./src/main/suratmasuk/suratmasuk.controller");
const SuratKeluarRoute = require("./src/main/suratkeluar/suratkeluar.controller");
const UsersRoute = require("./src/main/users/users.controller");
const StatistikRoute = require("./src/main/statistik/statistik.controller");

Routes.use("/api/suratmasuk", SuratMasukRoute);
Routes.use("/api/suratkeluar", SuratKeluarRoute);
Routes.use("/api/users", UsersRoute);
Routes.use("/api/statistik", StatistikRoute);

module.exports = Routes;
