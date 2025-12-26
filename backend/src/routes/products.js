const express = require("express");
const router = express.Router();
const db = require("../db");

/* CREATE */
router.post("/", (req, res) => {
  const { name, price } = req.body;
  db.query(
    "INSERT INTO products (name, price) VALUES (?,?)",
    [name, price],
    () => res.send({ message: "Product added" })
  );
});

/* READ */
router.get("/", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    res.send(result);
  });
});

/* UPDATE */
router.put("/:id", (req, res) => {
  const { name, price } = req.body;
  db.query(
    "UPDATE products SET name=?, price=? WHERE id=?",
    [name, price, req.params.id],
    () => res.send({ message: "Product updated" })
  );
});

/* DELETE */
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM products WHERE id=?",
    [req.params.id],
    () => res.send({ message: "Product deleted" })
  );
});

module.exports = router;

