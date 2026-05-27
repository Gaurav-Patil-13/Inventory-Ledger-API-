const express = require("express");
const path = require("path");
const db = require("./database");
const schema = require("./validation");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.post("/entries", (req, res) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(422).json({
      error: "validation_error",
      detail: error.details.map((e) => ({
        field: e.path[0],
        message: e.message,
      })),
    });
  }

  db.run(
    `INSERT INTO stock_entries
        (warehouse_id, category, item_name, week_number, quantity, unit, recorded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      value.warehouse_id,
      value.category,
      value.item_name,
      value.week_number,
      value.quantity,
      value.unit,
      value.recorded_by,
    ],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(409).json({
            error: "duplicate_entry",
            message: `An entry for this item in week ${value.week_number} already exists.`,
          });
        }

        return res.status(500).json({
          error: "server_error",
        });
      }

      db.get(
        "SELECT * FROM stock_entries WHERE id = ?",
        [this.lastID],
        (err, row) => {
          res.status(201).json(row);
        },
      );
    },
  );
});

app.get("/entries", (req, res) => {
  let query = "SELECT * FROM stock_entries WHERE 1=1";
  let params = [];

  if (req.query.category) {
    query += " AND category = ?";
    params.push(req.query.category);
  }

  db.all(query, params, (err, rows) => {
    res.json({
      count: rows.length,
      entries: rows,
    });
  });
});

app.get("/summary", (req, res) => {
  db.all(
    `
        SELECT
            category,
            week_number,
            SUM(quantity) as total_quantity,
            COUNT(*) as entry_count
        FROM stock_entries
        GROUP BY category, week_number
        ORDER BY week_number ASC, category ASC
    `,
    [],
    (err, rows) => {
      res.json({
        summary: rows,
      });
    },
  );
});

app.delete("/entries/:id", (req, res) => {
  db.get(
    "SELECT * FROM stock_entries WHERE id = ?",
    [req.params.id],
    (err, row) => {
      if (!row) {
        return res.status(404).json({
          error: "not_found",
          message: `Entry with id ${req.params.id} does not exist.`,
        });
      }

      db.run("DELETE FROM stock_entries WHERE id = ?", [req.params.id], () => {
        res.json({
          deleted: true,
          id: Number(req.params.id),
        });
      });
    },
  );
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

module.exports = app;
