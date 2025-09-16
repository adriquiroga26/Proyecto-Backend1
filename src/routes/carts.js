import { Router } from "express";
import { CartManager } from "../managers/CartManager.js";
import { ProductManager } from "../managers/ProductManager.js";

const router = Router();
const pm = new ProductManager();
const cm = new CartManager(undefined, pm);



router.post("/", async (req, res) => {
  try {
    const cart = await cm.createCart();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await cm.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const qty = req.body.quantity ? Number(req.body.quantity) : 1;
    const cart = await cm.addProductToCart(req.params.cid, req.params.pid, qty);
    res.status(200).json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
