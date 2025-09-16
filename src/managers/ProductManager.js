import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DEFAULT_PATH = path.resolve("data", "products.json");

export class ProductManager {
  constructor(filePath = DEFAULT_PATH) {
    this.path = filePath;
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

  /* LISTAR TODOS */
  async getProducts() {
    return await this._readFile();
  }

  /* OBTENER POR ID */
  async getProductById(id) {
    const products = await this._readFile();
    return products.find(p => String(p.id) === String(id)) || null;
  }

  /* AGREGAR PRODUCTO (id autogenerado) */
  async addProduct(productData) {
    const products = await this._readFile();

    // Validar campos requeridos
    const required = ["title", "description", "code", "price", "stock", "category"];
    for (const f of required) {
      if (productData[f] === undefined || productData[f] === "") {
        throw new Error(`Falta campo requerido: ${f}`);
      }
    }

    // Evitar code duplicado
    if (products.some(p => p.code === productData.code)) {
      throw new Error(`Ya existe un producto con code=${productData.code}`);
    }

    const newProduct = {
      id: this._generateId(),
      title: String(productData.title),
      description: String(productData.description),
      code: String(productData.code),
      price: Number(productData.price),
      status: productData.status === undefined ? true : Boolean(productData.status),
      stock: Number(productData.stock),
      category: String(productData.category),
      thumbnails: Array.isArray(productData.thumbnails) ? productData.thumbnails : []
    };

    products.push(newProduct);
    await this._writeFile(products);
    return newProduct;
  }

  /* ACTUALIZAR (no permitir cambiar id) */
  async updateProduct(id, changes) {
    const products = await this._readFile();
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return null;

    // Nunca cambiar el id
    if (changes.id !== undefined) delete changes.id;

    const updated = { ...products[idx], ...changes };

    // Tipados básicos
    if (updated.price !== undefined) updated.price = Number(updated.price);
    if (updated.stock !== undefined) updated.stock = Number(updated.stock);
    if (updated.thumbnails && !Array.isArray(updated.thumbnails)) {
      updated.thumbnails = [];
    }

    // Evitar duplicar code con otro producto distinto
    if (changes.code) {
      const conflict = products.some((p, i) => i !== idx && p.code === changes.code);
      if (conflict) throw new Error(`Otro producto ya usa el code=${changes.code}`);
    }

    products[idx] = updated;
    await this._writeFile(products);
    return updated;
  }

  /* ELIMINAR */
  async deleteProduct(id) {
    const products = await this._readFile();
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return false;
    products.splice(idx, 1);
    await this._writeFile(products);
    return true;
  }
}

