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
    // cookie: {
    //   maxAge: 2 * 60 * 1000,
    //   secure: true,
    //   httpOnly: true,
    // },
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
    "SELECT username, password, first_name, last_name, email, id FROM users WHERE username=$1",
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
app.get("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("id" + id);
    const query = "SELECT * FROM products WHERE id = $1";
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = result.rows[0];
    console.log(product);
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
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

app.post("/cart/add", (req, res) => {
  try {
    const { productId, name, price } = req.body;
    const cartItem = { productId, name, price };

    // Check if the cart exists in the session
    if (!req.session.cart) {
      req.session.cart = [];
    }
    // Add the product to the cart
    req.session.cart.push(cartItem);
    console.log(cartItem.name); // Access name from cartItem instead of directly from req.body
    res.json({ message: "Product added to cart successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "An error occurred while adding the product to the cart.",
    });
  }
});

app.get("/cart", (req, res) => {
  try {
    // Check if the cart exists in the session
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Send the JSON response with the cart items
    res.json({ cartItems: req.session.cart });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: "An error occurred while fetching cart items." });
  }
});
app.delete("/cart/remove/:productId", (req, res) => {
  try {
    const productId = req.params.productId;
    if (!req.session.cart) {
      req.session.cart = [];
    }

    let index = req.session.cart.findIndex(
      (item) => item.productId == productId
    );

    if (index !== -1) {
      req.session.cart.splice(index, 1);
      res.json({ message: "Product removed from cart successfully." });
    } else {
      res.status(404).json({ error: "Product not found in the cart." });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "An error occurred while removing the product from the cart.",
    });
  }
});
app.post("/order", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.id;
    const cartItems = req.session.cart;
    const totalPrice = cartItems.reduce(
      (total, item) => total + parseInt(item.price),
      0
    );
    const address = req.body.address;
    const order = await client.query(
      "INSERT INTO orders (user_id, total_price, address) VALUES ($1, $2, $3) RETURNING id",
      [userId, totalPrice, address]
    );
    const orderId = order.rows[0].id;
    const orderItems = cartItems.map((item) => {
      return client.query(
        "INSERT INTO order_items (order_id, product_id, name, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.productId, item.name, item.price]
      );
    });

    await Promise.all(orderItems);
    // Clear the session cart
    req.session.cart = [];
    res.json({ success: true, orderId: orderId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to process the order" });
  }
});
app.get("/orders", async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.id;

    // Fetch user orders
    const userOrders = await client.query(
      "SELECT id, total_price, address FROM orders WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    // Fetch order items for each order
    const orderItemsPromises = userOrders.rows.map(async (order) => {
      const orderItems = await client.query(
        "SELECT name, price FROM order_items WHERE order_id = $1",
        [order.id]
      );
      return orderItems.rows;
    });

    // Wait for all order items promises to resolve
    const orderItems = await Promise.all(orderItemsPromises);

    // Combine orders and order items into a single response object
    const responseData = userOrders.rows.map((order, index) => {
      return {
        id: order.id,
        address: order.address,
        total_price: order.total_price,
        order_items: orderItems[index],
      };
    });

    res.json({ orders: responseData });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
