# 🚀 Startup Guide - Astral Aone Sales App

## Quick Start

To get your professional sales and accounting dashboard running, you need to start both the backend and frontend.

## 1. Start the .NET Backend

Open a new terminal and run:

```bash
cd "AccountSalesApp.WebApp"
dotnet run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5086
info: Microsoft.Hosting.Lifetime[0]
      Application started.
```

**Backend URL:** http://localhost:5086

## 2. Start the Next.js Frontend

Open another terminal and run:

```bash
cd "account-sales-ui"
npm run dev
```

**Expected Output:**
```
- ready started server on 0.0.0.0:3001, url: http://localhost:3001
```

**Frontend URL:** http://localhost:3001

## 3. Access Your Dashboard

Open your browser and navigate to: **http://localhost:3001**

## 🔧 Troubleshooting

### Backend Issues

**Problem:** "Failed to fetch" error in frontend
**Solution:** Make sure the .NET backend is running on port 5086

**Problem:** Port 5086 already in use
**Solution:** 
```bash
# Find what's using the port
netstat -ano | findstr :5086
# Kill the process or change the port in appsettings.json
```

### Frontend Issues

**Problem:** npm install fails
**Solution:** 
```bash
npm cache clean --force
npm install
```

**Problem:** Port 3001 already in use
**Solution:** The app will automatically use the next available port

## 📱 What You'll See

### When Backend is Running:
- ✅ Real customer data from your database
- ✅ Live API integration
- ✅ Full functionality

### When Backend is Not Running:
- ⚠️ Yellow warning banner
- 📊 Demo data for demonstration
- 🔗 Instructions to start the backend

## 🎯 Features Available

- **Dashboard:** KPI metrics, charts, and recent activity
- **Customers:** Customer management with search and filters
- **Sales:** Sales tracking and performance analytics
- **Products:** Inventory management and catalog
- **Navigation:** Professional sidebar with collapsible menu

## 🔄 Development Workflow

1. **Start Backend First** - Always start the .NET backend before the frontend
2. **Frontend Auto-Reloads** - Changes to React components will automatically refresh
3. **Backend Restart** - If you change backend code, restart with `dotnet run`

## 🌐 API Endpoints

Your backend provides these endpoints:
- `GET /api/customers` - Customer data
- `GET /swagger` - API documentation (when running)

## 📁 Project Structure

```
Astral Aone sales app/
├── AccountSalesApp.WebApp/     # .NET Backend
│   ├── Controllers/            # API endpoints
│   ├── Models/                 # Data models
│   └── Program.cs              # Main entry point
└── account-sales-ui/           # Next.js Frontend
    ├── app/                    # Pages and routing
    ├── components/             # UI components
    └── lib/                    # Utilities
```

## 🎨 Customization

- **Colors:** Edit `tailwind.config.ts` for theme changes
- **Components:** Modify files in `components/` directory
- **Pages:** Add new pages in `app/` directory
- **Styling:** Update `globals.css` for global styles

## 🚀 Next Steps

1. **Explore the Dashboard** - Navigate through all sections
2. **Add Real Data** - Connect to your actual database
3. **Customize** - Modify colors, logos, and branding
4. **Extend** - Add new features and pages

---

**Need Help?** Check the main README.md for detailed documentation.
