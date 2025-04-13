import express from "express";
import fs from "fs/promises";

const router = express.Router();

router.get("/", async (req, res) => {
    const companyInfo = JSON.parse(await fs.readFile('./data/company_info.json'));
    res.json(companyInfo);
});

export default router;


