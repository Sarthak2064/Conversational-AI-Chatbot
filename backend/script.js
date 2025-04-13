// import OpenAI from "openai";
// import dotenv from "dotenv";

// dotenv.config();

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,  // Loading API key from .env
// });

// export const generateChatbotResponse = async (userQuery) => {
//     try {
//         const completion = await openai.chat.completions.create({
//             model: "gpt-4o-mini",
//             messages: [
//                 { role: "system", content: "You are a customer service bot for ABC Lighting Company. Answer queries based on products and company information only." },
//                 { role: "user", content: userQuery },
//             ],
//         });

//         return completion.choices[0].message.content;
//     } catch (error) {
//         console.error("Error from OpenAI API:", error);
//         return "Sorry, I'm unable to process your request right now.";
//     }
// };

