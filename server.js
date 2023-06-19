const express = require("express");
const { Client } = require("pg");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const app = express();
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
app.use(express.json());

app.use(helmet());
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
      //tableName: "session",
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

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login attempts. Please try again later.",
});

app.post("/login", loginRateLimiter, async (req, res) => {
  const { username, password } = req.body;
  // const hashedPassword = await bcrypt.hash(password, 10);
  const potentialLogin = await client.query(
    "SELECT username, password, first_name, last_name, email, id, role FROM users WHERE username=$1",
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
        role: potentialLogin.rows[0].role,
      };
      res.json({ loggedIn: true, user: potentialLogin.rows[0] });
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
    const usernameRegex = /^[A-Za-z0-9_.]+$/;
    const firstNameRegex = /^[A-Za-z\s-]+$/;
    const lastNameRegex = /^[A-Za-z\s-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()])[a-zA-Z\d!@#$%^&*()]+$/;

    if (!username.match(usernameRegex)) {
      return res
        .status(400)
        .json({ loggedIn: false, status: "Invalid username" });
    }
    if (!firstName.match(firstNameRegex)) {
      return res
        .status(400)
        .json({ loggedIn: false, status: "Invalid first name" });
    }
    if (!lastName.match(lastNameRegex)) {
      return res
        .status(400)
        .json({ loggedIn: false, status: "Invalid last name" });
    }
    if (!email.match(emailRegex)) {
      return res.status(400).json({ loggedIn: false, status: "Invalid email" });
    }
    if (!password.match(passwordRegex)) {
      return res
        .status(400)
        .json({ loggedIn: false, status: "Invalid password" });
    }
    const existingUser = await client.query(
      `SELECT username from users where username=$1`,
      [username]
    );
    if (existingUser.rowCount === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const signupUser = await client.query(
        "INSERT INTO users (username, first_name, last_name, email, password) values ($1, $2, $3, $4, $5) RETURNING *",
        [username, firstName, lastName, email, hashedPassword]
      );
      req.session.user = {
        id: signupUser.rows[0].id,
        username: signupUser.rows[0].username,
        first_name: signupUser.rows[0].first_name,
        last_name: signupUser.rows[0].last_name,
        email: signupUser.rows[0].email,
      };
      res.json({ loggedIn: true, user: signupUser.rows[0] });
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
      const userId = req.session.user.id;
      const currentUser = await client.query(
        `SELECT * from users where id=$1`,
        [userId]
      );
      res.json({ allUsers: allUsers.rows, current_user: currentUser.rows[0] });
    } else if (req.session.user.role === "customer") {
      const userId = req.session.user.id;
      const currentUser = await client.query(
        `SELECT * from users where id=$1`,
        [userId]
      );
      res.json({ current_user: currentUser.rows[0] });
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "admin") {
      const { id } = req.params;
      const { firstName, lastName, username, email, role } = req.body;
      const validRoles = ["admin", "customer"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role value" });
      }
      const updatedUser = await client.query(
        "UPDATE users SET first_name = $1, last_name = $2, username = $3, email = $4, role = $5 WHERE id = $6 RETURNING *",
        [firstName, lastName, username, email, role, id]
      );
      res.json(updatedUser.rows[0]);
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});
app.delete("/users/remove/:id", async (req, res) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "admin") {
      const { id } = req.params;
      const user = await client.query("SELECT * FROM users WHERE id = $1", [
        id,
      ]);
      if (user.rows.length === 0) {
        return res.status(404).json({ error: "User not found in the list" });
      }

      await client.query("DELETE FROM users WHERE id=$1", [id]);

      res.json({ message: "User removed from cart successfully." });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "An error occurred while removing user from the list.",
    });
  }
});
app.post("/addNewProduct", async (req, res) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "admin") {
      const {
        name,
        description,
        price,
        brand,
        product_type,
        color,
        quantity,
        specifications,
        image,
      } = req.body;

      await client.query(
        "INSERT INTO products (name, description,price,brand,product_type,color,quantity,specifications, image) values ($1, $2, $3, $4, $5, $6,$7, $8, $9) RETURNING *",
        [
          name,
          description,
          price,
          brand,
          product_type,
          color,
          quantity,
          specifications,
          image,
        ]
      );
      res.json({ added: true });
    } else {
      res.status(401).json({ added: false, error: "Unauthorized" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ added: false, error: "Error adding product" });
  }
});
app.put("/manageProducts/:id", async (req, res) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "admin") {
      const { id } = req.params;
      const { name, description, price, brand, product_type, color, quantity } =
        req.body;

      const updatedProduct = await client.query(
        "UPDATE products SET name = $1, description = $2, price = $3, brand = $4, product_type = $5, color = $6, quantity = $7 WHERE id = $8 RETURNING *",
        [name, description, price, brand, product_type, color, quantity, id]
      );
      res.json(updatedProduct.rows[0]);
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});
app.delete("/manageProducts/remove/:id", async (req, res) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "admin") {
      const { id } = req.params;
      const product = await client.query(
        "SELECT * FROM products WHERE id = $1",
        [id]
      );
      if (product.rows.length === 0) {
        return res.status(404).json({ error: "Product not found in the list" });
      }

      await client.query("DELETE FROM products WHERE id=$1", [id]);

      res.json({ message: "Product removed from cart successfully." });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "An error occurred while removing product from the list.",
    });
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
    const query = "SELECT * FROM products WHERE id = $1";
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = result.rows[0];
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

app.post("/cart/add", async (req, res) => {
  try {
    const { productId, name, price, photo, quantity, brand, product_type } =
      req.body;
    const cartItem = {
      productId,
      name,
      price,
      photo,
      quantity,
      brand,
      product_type,
    };

    // Check if the user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.id;

    // Fetch the user's current cart
    const userCart = await client.query(
      "SELECT cart FROM users WHERE id = $1",
      [userId]
    );

    let currentCart =
      userCart.rows.length > 0 && userCart.rows[0] ? userCart.rows[0].cart : [];

    // Convert the currentCart to an array if it's not already
    if (!Array.isArray(currentCart)) {
      currentCart = [];
    }

    const itemIndex = currentCart.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex !== -1) {
      return res.json({ message: "Product already in the cart." });
    }

    const updatedCart = [...currentCart, cartItem];

    await client.query("UPDATE users SET cart = $1 WHERE id = $2", [
      updatedCart,
      userId,
    ]);

    res.json({ message: "success" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "An error occurred while adding the product to the cart.",
    });
  }
});

app.get("/cart", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.id;
    const userCart = await client.query(
      "SELECT cart FROM users WHERE id = $1",
      [userId]
    );

    const cartItems =
      userCart.rows.length > 0 && userCart.rows[0].cart
        ? userCart.rows[0].cart
        : [];
    res.json({ cartItems, cart_length: cartItems.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch the cart items" });
  }
});

app.delete("/cart/remove/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.id;

    const userCart = await client.query(
      "SELECT cart FROM users WHERE id = $1",
      [userId]
    );

    const currentCart = userCart.rows.length > 0 ? userCart.rows[0].cart : [];

    const itemIndex = currentCart.findIndex(
      (item) => item.productId == productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Product not found in the cart." });
    }

    currentCart.splice(itemIndex, 1);

    await client.query("UPDATE users SET cart = $1 WHERE id = $2", [
      currentCart,
      userId,
    ]);

    res.json({ message: "Product removed from cart successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "An error occurred while removing the product from the cart.",
    });
  }
});
app.put("/cart/update/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.id;

    const userCart = await client.query(
      "SELECT cart FROM users WHERE id = $1",
      [userId]
    );

    const currentCart = userCart.rows.length > 0 ? userCart.rows[0].cart : [];

    const itemIndex = currentCart.findIndex(
      (item) => item.productId == productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Product not found in the cart." });
    }

    currentCart[itemIndex].quantity = quantity;

    await client.query("UPDATE users SET cart = $1 WHERE id = $2", [
      currentCart,
      userId,
    ]);

    res.json({ message: "Product quantity updated successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error:
        "An error occurred while updating the product quantity in the cart.",
    });
  }
});

app.post("/order", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.id;
    const userCart = await client.query(
      "SELECT cart FROM users WHERE id = $1",
      [userId]
    );
    const cartItems = userCart.rows[0].cart;
    const totalPrice = cartItems.reduce(
      (total, item) => total + parseInt(item.price) * parseInt(item.quantity),
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
        "INSERT INTO order_items (order_id, product_id, name, price, photo, quantity) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          orderId,
          item.productId,
          item.name,
          item.price,
          item.photo,
          item.quantity,
        ]
      );
    });

    await Promise.all(orderItems);

    cartItems.map((item) =>
      client.query(
        "UPDATE products SET quantity = quantity - $1 WHERE id = $2",
        [parseInt(item.quantity), item.productId]
      )
    );

    // Clear the cart column in the users table
    await client.query("UPDATE users SET cart = $1 WHERE id = $2", [
      [],
      userId,
    ]);

    // Clear the session cart
    req.session.cart = [];

    res.json({ success: true, orderId: orderId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to process the order" });
  }
});
app.post("/order", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.id;
    const userCart = await client.query(
      "SELECT cart FROM users WHERE id = $1",
      [userId]
    );
    const cartItems = userCart.rows[0].cart;
    const totalPrice = cartItems.reduce(
      (total, item) => total + parseInt(item.price) * parseInt(item.quantity),
      0
    );

    const address = req.body.address;
    const order = await client.query(
      "INSERT INTO orders (user_id, total_price, address) VALUES ($1, $2, $3) RETURNING id",
      [userId, totalPrice, address]
    );
    const orderId = order.rows[0].id;

    const orderItemsPromises = cartItems.map((item) => {
      return client.query(
        "INSERT INTO order_items (order_id, product_id, name, price, photo, quantity) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          orderId,
          item.productId,
          item.name,
          item.price,
          item.photo,
          item.quantity,
        ]
      );
    });

    const orderItems = await Promise.all(orderItemsPromises);
    console.log(orderItems);
    cartItems.map((item) =>
      client.query(
        "UPDATE products SET quantity = quantity - $1 WHERE id = $2",
        [parseInt(item.quantity), item.productId]
      )
    );
    // Clear the cart column in the users table
    await client.query("UPDATE users SET cart = $1 WHERE id = $2", [
      [],
      userId,
    ]);

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

    const orderItemsPromises = userOrders.rows.map(async (order) => {
      const orderItems = await client.query(
        "SELECT name, price, photo, quantity FROM order_items WHERE order_id = $1",
        [order.id]
      );
      return orderItems.rows;
    });

    const orderItems = await Promise.all(orderItemsPromises);

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

app.post("/wishlist/add", async (req, res) => {
  try {
    const { productId, name, price, photo } = req.body;
    const wishlistItem = { productId, name, price, photo };

    // Check if the user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.id;

    // Fetch the user's current wishlist
    const userWishlist = await client.query(
      "SELECT wishlist FROM users WHERE id = $1",
      [userId]
    );

    let currentWishlist =
      userWishlist.rows.length > 0 && userWishlist.rows[0]
        ? userWishlist.rows[0].wishlist
        : [];
    if (!Array.isArray(currentWishlist)) {
      currentWishlist = [];
    }
    const itemIndex = currentWishlist.findIndex(
      (item) => item.productId == productId
    );

    if (itemIndex !== -1) {
      currentWishlist.splice(itemIndex, 1);
      await client.query("UPDATE users SET wishlist = $1 WHERE id = $2", [
        currentWishlist,
        userId,
      ]);
      return res.json({
        message: "Product removed from wishlist.",
        removed: true,
        added: false,
      });
    }

    const updatedWishlist = [...currentWishlist, wishlistItem];

    await client.query("UPDATE users SET wishlist = $1 WHERE id = $2", [
      updatedWishlist,
      userId,
    ]);

    res.json({
      message: "Product added to wishlist successfully.",
      removed: false,
      added: true,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "An error occurred while adding the product to the wishlist.",
    });
  }
});

app.get("/wishlist", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.session.user.id;
    const userWishlist = await client.query(
      "SELECT wishlist FROM users WHERE id = $1",
      [userId]
    );
    const wishlistItems =
      userWishlist.rows.length > 0 && userWishlist.rows[0]
        ? userWishlist.rows[0].wishlist
        : [];

    res.json({ wishlistItems });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch the wishlist" });
  }
});
app.delete("/wishlist/remove/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if the user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.session.user.id;

    // Fetch the user's current wishlist
    const userWishlist = await client.query(
      "SELECT wishlist FROM users WHERE id = $1",
      [userId]
    );

    const currentWishlist =
      userWishlist.rows.length > 0 ? userWishlist.rows[0].wishlist : [];

    const itemIndex = currentWishlist.findIndex(
      (item) => item.productId == productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Product not found in wishlist." });
    }

    currentWishlist.splice(itemIndex, 1);

    await client.query("UPDATE users SET wishlist = $1 WHERE id = $2", [
      currentWishlist,
      userId,
    ]);

    res.json({ message: "Product removed from wishlist successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: "An error occurred while removing the product from the wishlist.",
    });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
