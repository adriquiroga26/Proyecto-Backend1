import { Router } from "express";
import { ProductManager } from "../managers/ProductManager.js";


const router = Router();
const pm = new ProductManager();



router.get("/", async (req, res) => {
  try {
    const products = await pm.getProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const p = await pm.getProductById(req.params.pid);
    if (!p) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newP = await pm.addProduct(req.body);
    res.status(201).json(newP);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updated = await pm.updateProduct(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const ok = await pm.deleteProduct(req.params.pid);
    if (!ok) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
