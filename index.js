
require('dotenv').config();

console.log("ENV =", process.env);
console.log("JWT_SECRET =", process.env.JWT_SECRET);

const express = require("express");
const connectToMongo = require("./db");

connectToMongo();

const app = express();
const port = 5000;


//Available Routes
// app.get("/", (req, res) => {
//   res.send("Hello Shivani my first backend api");
// });


app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));


app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});