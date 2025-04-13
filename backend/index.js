import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import companyInfoRoute from "./routes/companyInfo.js";
import productsRoute from "./routes/products.js";
import productImagesRoute from "./routes/productImages.js";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize GoogleGenAI SDK
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use("/api/company-info", companyInfoRoute);
app.use("/api/products", productsRoute);
app.use("/api/product-images", productImagesRoute);

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    try {
        // Generate response from Gemini
        const response = await genAI.models.generateContent({
            model: "gemini-2.0-flash", // or gemini-pro
            contents: `Act like a customer support agent for ABC Lighting Company.
If users greets you by saying Hello/Hi then provide your own response else Answer only from company data like company info, product info or product images.
User asked: ${userMessage}.
Tell me the intent as one of: "company_info", "product_info", "product_image", "greeting.
If the user says something like "no", "no thanks", "no thank you", "not interested", or similar negative responses, classify it as "negative_response".
`,
        });

        const geminiResponse = response.text;
        console.log("Gemini Response:", geminiResponse);

        let reply = "Sorry, I couldn't understand.";

        if (geminiResponse.includes("company_info")) {
            const companyInfoResponse = await axios.get("http://localhost:3000/api/company-info");
            const { company_name, locations, business_hours } = companyInfoResponse.data;

            const plainText = `Company Name: ${company_name}\n` +
                `Locations:\n${locations.map(loc => `- ${loc}`).join("\n")}\n` +
                `Business Hours: ${business_hours}\n`;

            reply = plainText;
            return res.json({ reply });
        } else if (geminiResponse.includes("product_info")) {
            const productsInfoResponse = await axios.get("http://localhost:3000/api/products");
            const products = productsInfoResponse.data;

            const plainText = products.map(product => {
                return `
        Product Name: ${product.name}
        Model: ${product.model}
        Size: ${product.size}
        Battery Life: ${product.battery_life}
        Features:
        ${product.features.map(f => `  - ${f}`).join("\n")}
        `;
            }).join("\n-----------------------\n");

            reply = plainText.trim();
            return res.json({ reply });
        }
        else if (geminiResponse.includes("product_image")) {
            const productImageResponse = await axios.get("http://localhost:3000/api/product-images");
            const productImages = productImageResponse.data;

            // Combine Gemini response and user message for better matching
            const combinedText = `${geminiResponse} ${userMessage}`.toLowerCase();

            // Create a scoring system to find the best match
            let bestMatch = null;
            let highestScore = 0;

            Object.keys(productImages).forEach(key => {
                // Create variations of the product name for better matching
                const normalizedKey = key.toLowerCase().replace(/_/g, " ");
                const keyWords = normalizedKey.split(" ");

                // Calculate a match score
                let score = 0;

                // Check for full product name match
                if (combinedText.includes(normalizedKey)) {
                    score += 10; // High score for exact match
                }

                // Check for key words like "street", "driveway", "wall", "outdoor"
                keyWords.forEach(word => {
                    if (combinedText.includes(word)) {
                        // Give higher weight to specific product types
                        if (word === "street" || word === "driveway" || word === "wall" || word === "outdoor") {
                            score += 5;
                        } else {
                            score += 1;
                        }
                    }
                });

                // Update best match if current score is higher
                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = key;
                }
            });

            if (bestMatch && highestScore > 3) { // Require a minimum score to consider it a match
                reply = productImages[bestMatch];
            } else {
                reply = "Sorry, I couldn't find a matching product image. We have street lights, driveway lights, and outdoor wall lights available.";
            }

            return res.json({ reply });
        } else if (geminiResponse.includes("greeting")) {
            const match = geminiResponse.match(/"([^"]+)"/);
            reply = match ? match[1] : "Hello! How can I assist you today?";
            return res.json({ reply });
        } else if (geminiResponse.includes("negative_response")) {
            reply = "I understand. Before you go, would you like to leave your contact information so we can reach out with our latest promotions or if you have any questions in the future?";
            return res.json({ reply });
        }
        res.json({ reply });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
