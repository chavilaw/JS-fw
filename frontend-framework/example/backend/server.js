const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.static(path.join(__dirname, "../../framework")));

let todos = [];
let nextId = 1;

app.get("/api/todos", (req, res) => {
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const newTodo = {
    id: req.body.id || nextId++,
    text: req.body.text,
    completed: req.body.completed || false
  };
  todos.push(newTodo);
  if (newTodo.id >= nextId) {
    nextId = newTodo.id + 1;
  }
  res.json(todos);
});

app.put("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => (t.id || 0) === id);
  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }
  todos[todoIndex] = { ...todos[todoIndex], ...req.body };
  res.json(todos);
});

app.delete("/api/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex(t => (t.id || 0) === id);
  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }
  todos.splice(todoIndex, 1);
  res.json(todos);
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
