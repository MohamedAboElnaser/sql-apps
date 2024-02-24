const path = require("path");
const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const { user, host, port, database, password } = require("pg/lib/defaults");

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);
router.get("/detail-client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail-client.js"))
);
router.get("/style.css", (_, res) =>
  res.sendFile(path.join(__dirname, "../style.css"))
);
router.get("/detail", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail.html"))
);

/**
 * Student code starts here
 */

// connect to postgres
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  port: 5432,
  database: "recipeguru",
  password: "mohamed",
});

router.get("/search", async function (req, res) {
  console.log("search recipes");

  // return recipe_id, title, and the first photo as url
  //
  // for recipes without photos, return url as default.jpg
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (recipe_id)
    recipe_id, title, COALESCE(recipes_photos.url, 'default.jpg') AS url
  FROM
    recipes  
  natural JOIN
    recipes_photos  
  `
  );
  res.status(200).json({ rows }).end();
});

router.get("/get", async (req, res) => {
  const recipeId = req.query.id ? +req.query.id : 1;
  console.log("recipe get", recipeId);
  const ingredientsPromise = pool.query(
    `
    SELECT
      i.title AS ingredient_title,
      i.image AS ingredient_image,
      i.type AS ingredient_type
    FROM
      recipe_ingredients ri

    INNER JOIN
      ingredients i
    ON
      i.id = ri.ingredient_id

    WHERE
      ri.recipe_id = $1;
  `,
    [recipeId]
  );

  const photosPromise = pool.query(
    `
    SELECT 
      r.title, r.body, COALESCE(rp.url, 'default.jpg') AS url
    FROM 
      recipes r

    LEFT JOIN
      recipes_photos rp
    ON
      rp.recipe_id = r.recipe_id

    WHERE 
      r.recipe_id = $1;
  `,
    [recipeId]
  );

  const [{ rows: photosRows }, { rows: ingredientsRows }] = await Promise.all([
    photosPromise,
    ingredientsPromise,
  ]);

  res.json({
    ingredients: ingredientsRows,
    photos: photosRows.map((photo) => photo.url),
    title: photosRows[0].title,
    body: photosRows[0].body,
  });
});
/**
 * Student code ends here
 */

module.exports = router;
