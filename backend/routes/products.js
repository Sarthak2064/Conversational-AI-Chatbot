import express from "express";
import fs from "fs/promises";

const router = express.Router();

router.get("/", async (req, res) => {
    const products = JSON.parse(await fs.readFile('./data/products.json'));
    res.json(products);
});

export default router;