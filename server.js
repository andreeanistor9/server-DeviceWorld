const express = require("express");
const { Client } = require("pg");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const app = express();
const bcrypt = require("bcrypt");

app.use(express.json());

var client = new Client({
  user: "Andreea Nistor",
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
    store: new pgSession({
      conString: "postgres://Andreea Nistor:parola@localhost/db_electronix",
      tableName: "session",
    }),
    secret: "abcdefg",
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 2 * 60 * 1000,
      secure: true,
      httpOnly: true,
    },
  })
);
//adauga o modalitate de verificare daca userul este logat
app.use((req, res, next) => {
  if (req.session.user) {
    res.locals.user = req.session.user;
  }
  next();
});
app.get("/", (req, res) => {
  res.send("Welcome to my app");
});
// module.exports = function(app) {
//   app.use(proxy('/api', { target: 'http://localhost:5000' }));
// };

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // const hashedPassword = await bcrypt.hash(password, 10);
  const potentialLogin = await client.query(
    "SELECT username, password, first_name, last_name, email FROM users WHERE username=$1",
    [username]
  );
  if (potentialLogin.rowCount > 0) {
    const isSamePassword = await bcrypt.compare(
      password,
      potentialLogin.rows[0].password
    );
    if (isSamePassword) {
      req.session.user = {
        id: potentialLogin.rows[0].id,
        username: potentialLogin.rows[0].username,
        first_name: potentialLogin.rows[0].first_name,
        last_name: potentialLogin.rows[0].last_name,
        email: potentialLogin.rows[0].email,
      };
      res.json({ loggedIn: true });
    } else {
      res.json({ loggedIn: false, status: "Wrong username or password!" });
      console.log("not good");
    }
  } else {
    res.json({ loggedIn: false, status: "Wrong username or password" });
  }
});
app.post("/signup", async (req, res) => {
  try {
    const { username, firstName, lastName, email, password } = req.body;
    const existingUser = await client.query(
      `SELECT username from users where username=$1`,
      [username]
    );
    if (existingUser.rowCount === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await client.query(
        "INSERT INTO users (username, first_name, last_name, email, password) values ($1, $2, $3, $4, $5) RETURNING *",
        [username, firstName, lastName, email, hashedPassword]
      );
      req.session.user = {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        first_name: newUser.rows[0].first_name,
        last_name: newUser.rows[0].last_name,
        email: newUser.rows[0].email,
      };
      res.json({ loggedIn: true, user: newUser.rows[0] });
    } else {
      res
        .status(400)
        .json({ loggedIn: false, status: "Username already taken" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ loggedIn: false, status: "Error signing up" });
  }
});

app.get("/users", async (req, res) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "admin") {
      const allUsers = await client.query("SELECT * from users");
      res.json(allUsers.rows);
    }
  } catch (err) {
    console.log(err.message);
  }
});
app.get("/products", async (req, res) => {
  try {
    if (req.query.type) {
      const { type, brand } = req.query;
      let query = "SELECT * FROM products WHERE 1=1";
      let params = [];
      if (type) {
        query += " AND product_type = $1";
        params.push(type.toLowerCase());
      }
      if (brand) {
        query += " AND brand = $2";
        params.push(brand.toLowerCase());
      }
      const result = await client.query(query, params);
      if (!type) {
        const brandResult = await client.query(
          "SELECT * FROM unnest(enum_range(null::brands))"
        );

        const brandOptions = brandResult.rows.map((row) => row.unnest);
        console.log(brandOptions);
        res.json({ products: result.rows, brandOptions: brandOptions });
      } else {
        res.json({ products: result.rows });
      }
    } else {
      const allProducts = await client.query("SELECT * FROM products");
      res.json({ products: allProducts.rows });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/logout", (req, res) => {
  // if (req.session.user) {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie("connect.sid");
      res.redirect("/");
    }
  });
  // } else {
  //   res.redirect("/");
  // }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
