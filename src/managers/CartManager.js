import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DEFAULT_PATH = path.resolve("data", "carts.json");

export class CartManager {
    constructor(cartFilePath = DEFAULT_PATH, productManager = null) {
    this.path = cartFilePath;
    this.productManager = productManager; 
  }

  async _readFile() {
    try {
      const content = await fs.readFile(this.path, "utf-8");
      return JSON.parse(content || "[]");
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.writeFile(this.path, "[]", "utf-8");
        return [];
      }
      throw err;
    }
  }

  async _writeFile(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2), "utf-8");
  }

  _generateId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  /* CREAR CARRITO */
  async createCart() {
    const carts = await this._readFile();
    const newCart = {
      id: this._generateId(),
      products: [] 
    };
    carts.push(newCart);
    await this._writeFile(carts);
    return newCart;
  }

  /* OBTENER CARRITO POR ID */
  async getCartById(id) {
    const carts = await this._readFile();
    return carts.find(c => String(c.id) === String(id)) || null;
  }

  
  async addProductToCart(cartId, productId, quantity = 1) {
    const carts = await this._readFile();
    const idx = carts.findIndex(c => String(c.id) === String(cartId));
    if (idx === -1) throw new Error("Carrito no encontrado");

    // validar producto si hay ProductManager
    if (this.productManager) {
      const exists = await this.productManager.getProductById(productId);
      if (!exists) throw new Error("Producto no encontrado (no se puede añadir)");
    }

    const cart = carts[idx];
    const existing = cart.products.find(p => String(p.product) === String(productId));
    if (existing) {
      existing.quantity = Number(existing.quantity) + Number(quantity);
    } else {
      cart.products.push({
        product: String(productId),
        quantity: Number(quantity)
      });
    }

    carts[idx] = cart;
    await this._writeFile(carts);
    return cart;
  }

  /*Eliminar producto del carrito o decrementar cantidad */
  async removeProductFromCart(cartId, productId, removeAll = false) {
    const carts = await this._readFile();
    const idx = carts.findIndex(c => String(c.id) === String(cartId));
    if (idx === -1) throw new Error("Carrito no encontrado");

    const cart = carts[idx];
    const pIdx = cart.products.findIndex(p => String(p.product) === String(productId));
    if (pIdx === -1) throw new Error("Producto no encontrado en el carrito");

    if (removeAll || cart.products[pIdx].quantity <= 1) {
      cart.products.splice(pIdx, 1);
    } else {
      cart.products[pIdx].quantity = Number(cart.products[pIdx].quantity) - 1;
    }

    carts[idx] = cart;
    await this._writeFile(carts);
    return cart;
  }
}
