const path = require("path");
const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);

/**
 * Student code starts here
 */
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "recipeguru",
  password: "mohamed",
  port: 5432,
});

// connect to postgres

router.get("/type", async (req, res) => {
  const { type } = req.query;
  console.log("get ingredients", type);

  // return all ingredients of a type
  const { rows } = await pool.query(
    "SELECT * FROM ingredients WHERE type = $1",
    [type]
  );
  res
    .status(200)
    .json({ status: `ingredients of ${type} returned successfully`, rows });
});

router.get("/search", async (req, res) => {
  let { term, page } = req.query;
  page = page ? page : 0;
  console.log("search ingredients", term, page);

  let whereClause;
  const params = [page * 5];
  if (term) {
    whereClause = `WHERE CONCAT(title, type) ILIKE $2`;
    params.push(`%${term}%`);
  }

  let { rows } = await pool.query(
    `SELECT *, COUNT(*) OVER ()::INTEGER AS total_count FROM ingredients ${whereClause} OFFSET $1 LIMIT 5`,
    params
  );
  res.json({ rows }).end();
});

/**
 * Student code ends here
 */

module.exports = router;
