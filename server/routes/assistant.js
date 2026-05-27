import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
const summaryModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const SCHEMAS_CONTEXT = `
You are an expert MongoDB developer. Given the user's natural language question and the Mongoose schemas below, you must generate a MongoDB query to answer their question.
You must return PURE JSON ONLY. No markdown formatting, no backticks, no explanations. 
The JSON must have this exact structure:
{
  "model": "Order" | "Product" | "User",
  "method": "find" | "aggregate",
  "query": <the query object or aggregation pipeline array>
}

ONLY use read-only operations ('find' or 'aggregate'). Do not mutate data.

Mongoose Schemas:
1. Order
{
  id: String,
  customer: { name: String, email: String, phone: String, address: String, city: String, state: String, pincode: String },
  items: [ { productId: String, name: String, price: Number, quantity: Number, size: String, color: String } ],
  subtotal: Number,
  shipping: Number,
  total: Number,
  status: String,
  paymentStatus: String,
  createdAt: Date,
  updatedAt: Date
}

2. Product
{
  id: String,
  name: String,
  price: Number,
  category: String,
  brand: String,
  stock: Number,
  status: String,
  createdAt: Date
}

3. User
{
  name: String,
  email: String,
  role: String,
  createdAt: Date
}
`;

router.post('/ask', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is missing' });

    const chatPrompt = `${SCHEMAS_CONTEXT}\n\nUser Question: "${prompt}"`;
    const result = await model.generateContent(chatPrompt);
    const responseText = result.response.text().trim();
    
    let jsonString = responseText;
    if (jsonString.startsWith('```json')) jsonString = jsonString.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (jsonString.startsWith('```')) jsonString = jsonString.replace(/^```/, '').replace(/```$/, '').trim();

    let queryObj;
    try {
      queryObj = JSON.parse(jsonString);
    } catch (err) {
      console.error('Failed to parse Gemini output:', jsonString);
      return res.status(500).json({ success: false, message: 'Failed to generate a valid database query.' });
    }

    const { model: targetModel, method, query } = queryObj;

    if (!['find', 'aggregate'].includes(method)) return res.status(400).json({ success: false, message: 'Only read operations are permitted.' });
    if (!['Order', 'Product', 'User'].includes(targetModel)) return res.status(400).json({ success: false, message: `Invalid model: ${targetModel}` });

    const MongooseModel = mongoose.model(targetModel);
    let dbResult;
    try {
      if (method === 'find') dbResult = await MongooseModel.find(query).limit(50).lean();
      else if (method === 'aggregate') dbResult = await MongooseModel.aggregate(query);
    } catch (dbErr) {
      console.error('Database query error:', dbErr);
      return res.status(500).json({ success: false, message: 'Error executing database query.' });
    }

    const summaryPrompt = `You are a helpful assistant for an admin dashboard. 
The user asked: "${prompt}"
The raw data from the database is:
${JSON.stringify(dbResult).slice(0, 5000)}

Provide a natural, friendly, and concise English summary answering the user's question based on this data. Do not show the raw JSON. Just give the answer.`;

    const summaryRes = await summaryModel.generateContent(summaryPrompt);
    const finalAnswer = summaryRes.response.text().trim();

    res.json({ success: true, answer: finalAnswer });
  } catch (error) {
    console.error('Assistant Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
