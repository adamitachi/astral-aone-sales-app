# 🚀 Azure Deployment Guide for Astral Aone Sales App

This guide will help you deploy your Astral Aone sales application to Azure using Azure DevOps.

## 📋 Prerequisites

1. **Azure Account** with free tier access
2. **Azure DevOps** organization and project
3. **Azure CLI** installed locally
4. **Git** repository with your code

## 🏗️ Step 1: Deploy Azure Infrastructure

### Option A: Using PowerShell Script (Recommended)

1. **Run the deployment script:**
   ```powershell
   .\deploy-to-azure.ps1 -ResourceGroupName "astral-aone-rg" -Location "East US"
   ```

2. **The script will:**
   - Create a resource group
   - Deploy App Service Plan (F1 - Free tier)
   - Deploy .NET backend App Service
   - Deploy PostgreSQL database
   - Create Azure Static Web App for frontend
   - Configure CORS settings

### Option B: Manual Azure CLI Deployment

1. **Create Resource Group:**
   ```bash
   az group create --name astral-aone-rg --location "East US"
   ```

2. **Deploy Infrastructure:**
   ```bash
   az deployment group create \
     --resource-group astral-aone-rg \
     --template-file azure-infrastructure.json \
     --parameters appName=astral-aone location="East US"
   ```

## 🔧 Step 2: Configure Azure DevOps

### 1. Create Azure DevOps Project

1. Go to [Azure DevOps](https://dev.azure.com)
2. Create a new project named "astral-aone-sales-app"
3. Choose Git as version control

### 2. Push Your Code

```bash
git remote add origin https://dev.azure.com/yourorg/astral-aone-sales-app/_git/astral-aone-sales-app
git add .
git commit -m "Initial commit with Azure deployment config"
git push -u origin main
```

### 3. Create Service Connection

1. Go to **Project Settings** → **Service Connections**
2. Click **New Service Connection**
3. Choose **Azure Resource Manager**
4. Select **Service Principal (automatic)**
5. Choose your subscription and resource group
6. Name it: `Azure-Subscription`

### 4. Create Pipeline

1. Go to **Pipelines** → **New Pipeline**
2. Choose **Azure Repos Git**
3. Select your repository
4. Choose **Existing Azure Pipelines YAML file**
5. Select `azure-pipelines.yml`
6. Click **Continue** and **Run**

## 🌐 Step 3: Configure Environment Variables

### Backend App Service Configuration

1. Go to Azure Portal → App Service → `astral-aone-backend`
2. **Configuration** → **Application settings**
3. Add these settings:

```
ASPNETCORE_ENVIRONMENT = Production
ConnectionStrings__DefaultConnection = Server=tcp:astral-aone-db-xxx.database.windows.net,1433;Initial Catalog=astralaonedb;Persist Security Info=False;User ID=astraladmin;Password=yourpassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
WEBSITE_RUN_FROM_PACKAGE = 1
```

### Frontend Environment Variables

1. In Azure DevOps pipeline, add these variables:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` - Get from Static Web App
   - `API_BASE_URL` - Your backend URL

## 🔄 Step 4: Update Frontend API Calls

Update your frontend API calls to use environment variables:

```typescript
// In your API calls, replace hardcoded URLs:
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5086';

// Example:
const response = await fetch(`${API_BASE_URL}/api/customers`);
```

## 🚀 Step 5: Deploy and Test

### 1. Run the Pipeline

1. Go to your pipeline in Azure DevOps
2. Click **Run Pipeline**
3. Monitor the build and deployment

### 2. Verify Deployment

- **Backend**: `https://astral-aone-backend.azurewebsites.net`
- **Frontend**: `https://astral-aone-frontend.azurestaticapps.net`
- **Database**: Check Azure Portal → PostgreSQL

### 3. Test the Application

1. Open the frontend URL
2. Test customer creation
3. Test invoice creation
4. Verify database connectivity

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check backend CORS configuration
   - Verify frontend URL is allowed

2. **Database Connection Issues**
   - Check connection string
   - Verify firewall rules
   - Check database server status

3. **Build Failures**
   - Check .NET version compatibility
   - Verify Node.js version
   - Check build logs in Azure DevOps

### Useful Commands

```bash
# Check Azure resources
az resource list --resource-group astral-aone-rg

# Check App Service logs
az webapp log tail --name astral-aone-backend --resource-group astral-aone-rg

# Check database connection
az postgres flexible-server show --name astral-aone-db-xxx --resource-group astral-aone-rg
```

## 💰 Cost Optimization

### Free Tier Limits

- **App Service Plan (F1)**: 1 GB RAM, 60 minutes/day
- **PostgreSQL Basic**: 5 DTUs, 5 GB storage
- **Static Web Apps**: 100 GB bandwidth/month

### Scaling Options

When you need more resources:
- Upgrade to B1 (Basic) App Service Plan: ~$13/month
- Upgrade to Standard PostgreSQL: ~$25/month
- Add CDN for better performance

## 📚 Additional Resources

- [Azure DevOps Documentation](https://docs.microsoft.com/en-us/azure/devops/)
- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/en-us/azure/postgresql/)

## 🎯 Next Steps

1. **Set up monitoring** with Application Insights
2. **Configure custom domain** for production
3. **Set up SSL certificates**
4. **Implement CI/CD** with feature branches
5. **Add automated testing** to the pipeline

---

**Need Help?** Check the troubleshooting section or create an issue in your Azure DevOps project.
