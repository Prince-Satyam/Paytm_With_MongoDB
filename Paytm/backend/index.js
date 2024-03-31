const express = require("express");
const cors = require("cors");
const mainRouter = require("./routes/index");

const app = express();

app.use(cors());
app.use(express.json());
// We have divided the routing so that in future when we will
// change the api from v1 to v2 then we have to make only slightest change
app.use("/api/v1", mainRouter);

app.listen(3000);