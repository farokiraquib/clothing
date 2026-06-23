# SupremeIt E-Commerce Store

## Local Development  
```bash
# Terminal 1 — Backend  
cd server && npm run dev

# Terminal 2 — Frontend  
cd client && npm run dev
```

## Deployment on Render.com (Free)

### Option 1: One-Click Deploy
1. Push this code to a GitHub repository
2. Go to [render.com](https://render.com) → Sign up / Log in
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo
5. Configure:
   - **Build Command**: `cd client && npm install && npm run build && cd ../server && npm install`
   - **Start Command**: `cd server && node server.js`
   - **Root Directory**: *(leave empty)*
6. Click **"Create Web Service"**

### Option 2: Using render.yaml (auto-detected)
Just push to GitHub — Render detects `render.yaml` automatically.

### Environment
- Set `PORT` to `10000` (Render's default)
- Node version is auto-detected

### After Deployment
Your site will be live at: `https://your-app-name.onrender.com`


## ⚠️ Important Notes
- **Free tier** spins down after 15 min of inactivity (first request takes ~30s)
- **File uploads** (product images, category banners) are stored on disk — they will be lost on free tier redeploys. For production, consider Cloudinary or S3.
- **JSON data files** are also on disk — same limitation. For production, use MongoDB Atlas (free tier).
