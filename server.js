const express = require("express");
const { Client } = require("pg");
const session = require("express-session");
const formidable = require("formidable");
const app = express();
protocol = "http://";
domainName = "localhost:5000";
var client = new Client({
  user: "andreean",
  password: "parola",
  host: "localhost",
  port: 5432,
  database: "db_electronix",
});

client.connect((err) => {
  if (err) throw err;
  console.log("Connected");
});

app.use(
  session({
    secret: "abcdefg",
    resave: true,
    saveUninitialized: false,
  })
);
//get all products from database
app.get("/products", async (req, res) => {
  try {
    const allProducts = await client.query(`select * from products`);
    res.json(allProducts.rows);
    // console.log(allProducts.rows);
  } catch (err) {
    console.log(err.message);
  }
});
// app.get("/product", async (req, res) => {
//   try {
//     const product = await client.query(
//       `select * from products where id=${req.params}`
//     );
//     res.json(product.rows);
//     console.log(product.rows);
//   } catch (err) {
//     console.log(err);
//   }
// });
//get all users from database
app.get("/users", async (req, res) => {
  try {
    const allUsers = await client.query(`select * from users`);
    res.json(allUsers.rows);
    console.log(allUsers.rows);
  } catch (err) {
    console.log(err.message);
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
