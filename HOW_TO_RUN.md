# How to Run the Application

Complete guide to set up and run the Learner Compass application with Virtual Lab.

## 📋 Prerequisites

- **Node.js** 18+ (Download from [nodejs.org](https://nodejs.org/))
- **npm** or **pnpm** (comes with Node.js)
- **Git** (optional, for cloning)

## 🚀 Quick Start

### Step 1: Install Dependencies

#### Frontend
```bash
cd learner-compass
npm install
# or
pnpm install
```

#### Backend
```bash
cd learner-compass/backend
npm install
```

### Step 2: Set Up Environment Variables

#### Frontend (.env file in `learner-compass/`)
Create a `.env` file with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Backend (.env file in `learner-compass/backend/`)
Create a `.env` file with Judge0 API credentials:
```env
PORT=5000
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here
```

**Note**: Get your Judge0 API key from [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)

### Step 3: Run the Application

#### Option A: Run Both Servers Separately (Recommended)

**Terminal 1 - Backend:**
```bash
cd learner-compass/backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd learner-compass
npm run dev
# App runs on http://localhost:5173
```

#### Option B: Use npm scripts (if configured)

```bash
# In learner-compass directory
npm run dev        # Frontend
npm run server     # Backend (in separate terminal)
```

### Step 4: Access the Application

1. Open your browser and go to: `http://localhost:5173`
2. Sign up or log in
3. Click **"Lab"** in the navigation bar to access the Virtual Lab
4. Or go directly to: `http://localhost:5173/lab/virtual-lab`

## 🎯 Accessing the Code Editor

### Method 1: Navigation Bar
- Click **"Lab"** button in the top navigation

### Method 2: Dashboard
- Go to `/dashboard`
- Click **"Open Lab"** in the Quick Access section

### Method 3: Direct URL
- Navigate to: `http://localhost:5173/lab/virtual-lab`

### Method 4: From Course Player
- Open any course
- Click **"Code Editor"** button in Quick Actions

## 🛠️ Troubleshooting

### Backend Not Running?
```bash
# Check if backend is running
curl http://localhost:5000

# Should return: "Learner Compass Backend is running"
```

### CORS Errors?
- Make sure backend is running on port 5000
- Check that `CORS` is enabled in `backend/server.js`

### Code Execution Not Working?
1. Verify backend is running: `http://localhost:5000`
2. Check browser console for errors
3. Verify Judge0 API key is set in backend `.env`
4. If no API key, backend will return simulated output

### Firebase Errors?
- Check `.env` file has correct Firebase credentials
- Verify Firestore security rules are set (see `FIREBASE_SETUP.md`)
- App will work with authentication even if Firestore fails

### Port Already in Use?
```bash
# Change port in backend/server.js or .env
PORT=5001  # Use different port

# Or kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill
```

## 📦 Production Build

### Build Frontend
```bash
cd learner-compass
npm run build
# Output in dist/ folder
```

### Run Production Backend
```bash
cd learner-compass/backend
npm start
```

## 🔧 Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Backend Logs**: Check terminal running backend for execution logs
3. **Browser Console**: Check for frontend errors
4. **Network Tab**: Monitor API calls in browser DevTools

## 📚 Next Steps

- Set up Firebase (see `FIREBASE_SETUP.md`)
- Configure Judge0 API key for real code execution
- Explore the Virtual Lab with different languages
- Check out Practice problems and Courses

## 🆘 Need Help?

- Check browser console for errors
- Verify all environment variables are set
- Ensure both servers are running
- Review `FIREBASE_SETUP.md` for Firebase configuration

Happy Coding! 🎉
