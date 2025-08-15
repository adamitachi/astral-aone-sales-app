# Astral Aone - Sales & Accounting Dashboard

A professional, enterprise-grade sales and accounting management system built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

### 🎯 **Professional Dashboard**
- **Real-time Metrics**: Revenue, customers, sales, and conversion rate tracking
- **Interactive Charts**: Sales performance visualization with Recharts
- **Recent Activity Feed**: Live updates on system activities
- **Quick Actions**: Fast access to common tasks

### 👥 **Customer Management**
- **Customer Database**: Comprehensive customer profiles and history
- **Advanced Search**: Search by name, email, or phone number
- **Status Tracking**: Active, inactive, and prospect customer management
- **Customer Analytics**: Spending patterns and engagement metrics

### 📊 **Sales Management**
- **Sales Tracking**: Complete sales pipeline management
- **Performance Analytics**: Sales metrics and conversion tracking
- **Salesperson Management**: Individual performance monitoring
- **Period-based Reporting**: Weekly, monthly, and quarterly views

### 🛍️ **Product Management**
- **Inventory Control**: Stock level monitoring and alerts
- **Product Catalog**: SKU management and categorization
- **Pricing Management**: Cost and profit margin tracking
- **Low Stock Alerts**: Automated inventory warnings

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works seamlessly on all devices
- **Professional Layout**: Clean, modern interface following enterprise standards
- **Interactive Components**: Hover effects, animations, and smooth transitions
- **Accessibility**: WCAG compliant design patterns

### 🔧 **Technical Features**
- **TypeScript**: Full type safety and better development experience
- **Component Library**: Reusable UI components with Radix UI
- **State Management**: Efficient state handling with React hooks
- **API Integration**: RESTful API integration with .NET backend

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- .NET 8.0+ (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd account-sales-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd ../AccountSalesApp.WebApp
   ```

2. **Run the .NET application**
   ```bash
   dotnet run
   ```

3. **Access the API**
   The backend will be available at [http://localhost:5086](http://localhost:5086)

## 📁 Project Structure

```
account-sales-ui/
├── app/                    # Next.js app directory
│   ├── customers/         # Customer management pages
│   ├── sales/            # Sales tracking pages
│   ├── products/         # Product management pages
│   ├── layout.tsx        # Main layout with sidebar
│   └── page.tsx          # Dashboard home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Button, Card, etc.)
│   ├── dashboard/        # Dashboard-specific components
│   └── layout/           # Layout components (Sidebar, Header)
├── lib/                  # Utility functions and helpers
└── public/               # Static assets
```

## 🎨 UI Components

### Core Components
- **Button**: Multiple variants (default, outline, ghost, destructive)
- **Card**: Flexible card layouts with headers, content, and footers
- **Badge**: Status indicators and labels
- **MetricsCard**: KPI display with trend indicators

### Dashboard Components
- **Sidebar**: Collapsible navigation with icons
- **Header**: Search, notifications, and user profile
- **SalesChart**: Interactive sales data visualization
- **RecentActivity**: Live activity feed

## 🔌 API Integration

The frontend integrates with the .NET backend through RESTful APIs:

- **Customers**: `GET /api/customers`
- **Sales**: `POST /api/sales`
- **Products**: `GET /api/products`
- **Reports**: `GET /api/reports`

## 🎯 Key Features

### Dashboard Analytics
- Revenue tracking and growth metrics
- Customer acquisition and retention
- Sales performance monitoring
- Inventory value calculations

### Business Intelligence
- Real-time data visualization
- Trend analysis and forecasting
- Performance benchmarking
- Custom report generation

### User Experience
- Intuitive navigation and workflows
- Responsive design for all devices
- Fast loading and smooth interactions
- Professional enterprise aesthetics

## 🚧 Development

### Adding New Pages
1. Create a new directory in `app/`
2. Add a `page.tsx` file
3. Update the sidebar navigation in `components/layout/sidebar.tsx`

### Styling
- Uses Tailwind CSS for styling
- Custom CSS variables for theming
- Responsive design utilities
- Component-based styling approach

### State Management
- React hooks for local state
- Context API for global state (if needed)
- Efficient re-rendering with proper dependencies

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured dashboard experience
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly mobile interface

## 🔒 Security Features

- CORS configuration for API access
- Input validation and sanitization
- Secure authentication (to be implemented)
- Role-based access control (to be implemented)

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5086
NEXT_PUBLIC_APP_NAME=Astral Aone
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
