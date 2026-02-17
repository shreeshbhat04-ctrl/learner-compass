# How to Access the Virtual Lab (Code Editor)

The Virtual Lab is your interactive coding environment where you can write and execute code in multiple programming languages.

## 🚀 Quick Access Methods

### Method 1: Navigation Bar (Easiest)
1. Look at the top navigation bar
2. Click on the **"Lab"** link (with a code icon)
3. You'll be taken directly to the Virtual Lab

### Method 2: Dashboard
1. Go to your **Dashboard** (`/dashboard`)
2. Scroll down to the **"Quick Access"** section
3. Click the **"Open Lab"** button

### Method 3: Direct URL
Simply navigate to:
```
http://localhost:5173/lab/virtual-lab
```
(Replace `localhost:5173` with your actual development server URL)

Or any lab ID:
```
http://localhost:5173/lab/[any-lab-id]
```

### Method 4: From Course Content
- Some courses may have direct links to specific lab exercises
- Example: `/lab/python-101` for Python exercises

## 📝 What You Can Do in the Lab

### Supported Languages
- **Python** - Python 3.8.1
- **C** - GCC 9.2.0
- **C++** - GCC 9.2.0
- **Java** - OpenJDK 13.0.1
- **JavaScript** - Node.js 12.14.0
- **C#** - Mono 6.6.0.161
- **Go** - Go 1.13.5
- **Rust** - Rust 1.40.0
- **MATLAB** - Octave 5.2.0 (MATLAB-compatible)
- **Verilog** - Icarus Verilog 12.0

### Features
- ✨ **Split-screen layout**: Instructions on the left, code editor on the right
- 🎨 **Syntax highlighting**: Full Monaco Editor support
- ▶️ **Run code**: Execute your code with one click
- 📊 **Terminal output**: See results in real-time
- 🔄 **Language switching**: Switch between languages seamlessly
- 📝 **Code templates**: Pre-filled starter code for each language

## 🎯 Using the Lab

1. **Select a Language**: Use the dropdown in the editor toolbar
2. **Write Your Code**: The editor supports full syntax highlighting
3. **Run Code**: Click the "Run Code" button (▶️)
4. **View Output**: See results in the terminal panel below
5. **Read Instructions**: Check the left panel for exercise details

## ⚙️ Backend Setup

Make sure the backend server is running:

```bash
cd learner-compass/backend
npm install
npm run dev
```

The backend should be running on `http://localhost:5000`

## 🔧 Troubleshooting

### Code execution not working?
- Check if the backend server is running
- Verify the backend URL in the browser console
- Check for CORS errors

### Can't see the Lab link?
- Make sure you're logged in (some features require authentication)
- Refresh the page
- Check the browser console for errors

### Code execution errors?
- Check the terminal output for error messages
- Verify your code syntax
- Make sure you're using the correct language template

## 📚 Next Steps

- Try different languages to see syntax highlighting
- Experiment with the code templates
- Check out the Dashboard for more learning resources
- Explore Practice problems for coding challenges

Happy Coding! 🎉
