require("dotenv").config();

const express = require("express");
const path = require("path");
const products = require("./data/products");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing. Add it to your .env file.");
}

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/products", (req, res) => {
  const { search, category, sort } = req.query;

  let result = [...products];

  if (search) {
    const query = String(search).toLowerCase();

    result = result.filter(product =>
      `${product.name} ${product.category}`
        .toLowerCase()
        .includes(query)
    );
  }

  if (category && category !== "All") {
    result = result.filter(
      product => product.category === category
    );
  }

  if (sort === "price-low") {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === "price-high") {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  }

  res.json(result);
});

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`Veloura is running at http://localhost:${PORT}`);
});