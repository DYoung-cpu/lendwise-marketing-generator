# Marketing Generator - Setup Instructions for Partner

## 📁 You Should Have Received

1. **GitHub Repository Access** - https://github.com/DYoung-cpu/lendwise-marketing-generator
2. **`config.js` file** - Sent separately (contains API keys)

---

## 🚀 Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/DYoung-cpu/lendwise-marketing-generator.git
cd lendwise-marketing-generator
```

### 2. Add the API Keys

**Place the `config.js` file you received into:**
```
lendwise-marketing-generator/wisr-ai-generator/config.js
```

⚠️ **IMPORTANT:**
- Do NOT commit this file to git (it's already gitignored)
- This file contains sensitive API keys - keep it private
- If you lost it, ask David for another copy

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

**Windows:**
```bash
START-MARKETING-GENERATOR.bat
```

**Mac/Linux:**
```bash
./start-server.sh
```

This will:
- ✅ Start backend server on port 3001
- ✅ Start frontend server on port 8080
- ✅ Open browser to http://localhost:8080/nano-test.html

---

## ✅ Verify It's Working

You should see:
1. **Two terminal windows** running (backend + frontend)
2. **Browser opens** to Marketing Generator
3. **Logo loads** (check console: "✅ Brand logo loaded successfully!")
4. **Templates available** in the dropdown

---

## 🛠️ Troubleshooting

### "config.js not found"
- Make sure you placed the file at: `wisr-ai-generator/config.js`
- Check the file exists: `ls wisr-ai-generator/config.js`

### "Failed to fetch" error
- Ensure both servers are running (backend + frontend)
- Backend should show: `✅ Server running on http://localhost:3001`
- Frontend should show: `Serving HTTP on :: port 8080`

### Logo doesn't load
- Open browser console (F12)
- Look for: `✅ Brand logo loaded successfully!`
- If missing, refresh the page (F5)

### Generation fails
- Check backend terminal for errors
- Verify API keys are correct in `config.js`
- Try again - system auto-fixes common issues

---

## 📚 Documentation

- **Frontend README**: `wisr-ai-generator/README.md`
- **Main README**: `README-MARKETING-GENERATOR.md`
- **Project Memory**: `wisr-ai-generator/.claude/project-memory.md` (complete technical docs)

---

## 🤝 Need Help?

Contact David Young:
- Email: david@lendwisemortgage.com
- Check the repository issues: https://github.com/DYoung-cpu/lendwise-marketing-generator/issues

---

**Repository:** https://github.com/DYoung-cpu/lendwise-marketing-generator
**Last Updated:** October 20, 2025
