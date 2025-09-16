import express from "express";
import carts from "./src/routes/carts.js";
import products from "./src/routes/Products.js"


const app = express();
const PORT = 8080;

app.use(express.json());


app.use("/api/products", products);
app.use("/api/carts", carts);


app.get("/", (req, res) => {
  res.send("API - Entrega N°1: /api/products  & /api/carts");
});

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});



