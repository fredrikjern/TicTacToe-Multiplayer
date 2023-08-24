const express = require("express");
const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("views/index.html");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
