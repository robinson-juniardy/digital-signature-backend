const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const Routes = require("./routes");

require("dotenv").config();

const app = express();

// app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(Routes);

app.listen(process.env.PORT, () =>
  console.log(`server started on port ${process.env.PORT}`)
);
