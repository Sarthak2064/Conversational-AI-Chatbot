import express from "express";
import fs from "fs/promises";

const router = express.Router();

router.get("/", async (req, res) => {
    const images = JSON.parse(await fs.readFile('./data/products_images.json'));
    res.json(images);
});

export default router;