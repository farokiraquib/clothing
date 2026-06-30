# SupremeIt E-Commerce Store

SupremeIt is a modern, full-stack e-commerce platform designed to provide a premium shopping experience. It features a robust frontend built with React and Vite, and a powerful Node.js/Express backend connected to MongoDB. The platform includes a comprehensive admin dashboard, secure authentication, seamless payment integration, and an AI-powered shopping assistant.

## 🚀 Key Features

### 🛍️ User Experience
- **Product Discovery:** Browse products, filter by categories and brands, and view detailed product pages with reviews.
- **Shopping Cart & Wishlist:** Add items to cart or save them for later in your wishlist.
- **Checkout & Payments:** Secure checkout process integrated with **Razorpay**.
- **Order Tracking:** Track order status from processing to delivery.
- **User Profiles:** Manage personal information, addresses, and view order history.
- **AI Shopping Assistant:** Get personalized recommendations and help powered by Google Generative AI (Gemini).

### 🛡️ Admin Dashboard
- **Product Management:** Add, edit, and delete products, manage inventory.
- **Order Management:** View and update order statuses.
- **Category & Brand Management:** Organize products efficiently.
- **Image Uploads:** Seamless image hosting using **Cloudinary**.

## 🛠️ Tech Stack

**Frontend:**
- React (v19)
- Vite for fast bundling
- React Router DOM for routing
- Lucide React & React Icons for modern UI icons
- React Helmet Async for SEO optimization

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose for database management
- JWT (JSON Web Tokens) & bcryptjs for secure authentication
- Razorpay for payment processing
- Resend for email notifications
- Cloudinary & Multer for image uploads
- Google Generative AI (Gemini) for the AI assistant

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- Cloudinary Account (for image uploads)
- Razorpay Account (for payment gateway)
- Resend Account (for sending emails)
- Google AI Studio API Key (for Gemini Assistant)

## 🔧 Environment Variables

Create a `.env` file in the `server` directory and add the following variables:

```env
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Emails (Resend)
RESEND_API_KEY=your_resend_api_key

# AI Assistant
GEMINI_API_KEY=your_gemini_api_key
```

## 💻 Local Development

1. **Install Dependencies**
   Run the following command from the root directory to install dependencies for both frontend and backend:
   ```bash
   npm run install:all
   ```
   *(Alternatively, run `npm install` inside both `client` and `server` folders.)*

2. **Start the Backend Server**
   Open a terminal and run:
   ```bash
   cd server
   npm run dev
   ```

3. **Start the Frontend Application**
   Open a second terminal and run:
   ```bash
   cd client
   npm run dev
   ```

## 🌐 Deployment on Render.com (Free)

This project is configured for easy deployment on Render.

### Option 1: One-Click Deploy
1. Push this code to a GitHub repository.
2. Go to [render.com](https://render.com) → Sign up / Log in.
3. Click **"New +"** → **"Web Service"**.
4. Connect your GitHub repo.
5. Configure:
   - **Build Command**: `cd client && npm install && npm run build && cd ../server && npm install`
   - **Start Command**: `cd server && node server.js`
   - **Root Directory**: *(leave empty)*
6. Add your Environment Variables in the Render dashboard.
7. Click **"Create Web Service"**.

### Option 2: Using `render.yaml` (auto-detected)
Just push to GitHub — Render detects the `render.yaml` file automatically and sets up the services based on its configuration.

### After Deployment
Your site will be live at: `https://your-app-name.onrender.com`

## ⚠️ Important Notes

- **Free Tier Limitations:** On Render's free tier, the application spins down after 15 minutes of inactivity. The first request after spinning down may take ~30 seconds to load.
- **File Uploads:** While Cloudinary is set up, make sure your credentials are correct so images persist. Local file uploads on Render's free tier will be lost upon redeployment.
- **Database:** Use MongoDB Atlas for production to ensure your data is persistent and secure.
