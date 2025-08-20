# Azure DevOps Deployment Checklist

## Prerequisites
- [ ] Azure subscription with App Service and Static Web Apps
- [ ] Azure DevOps project with pipeline access
- [ ] Resource group created in Azure

## Step 1: Create Azure Service Connection

1. **Go to Azure DevOps Project Settings**
   - Navigate to your project
   - Click **Project Settings** (bottom left)
   - Select **Service Connections**

2. **Create New Service Connection**
   - Click **"New service connection"**
   - Select **"Azure Resource Manager"**
   - Choose **"Service principal (automatic)"**
   - **Important**: Name it exactly `Azure-Subscription-Connection`
   - Select your Azure subscription
   - Select your resource group
   - Click **Save**

## Step 2: Set Up Pipeline Variables

1. **Go to Pipelines → Library**
   - Create a new **Variable Group** named `Deployment-Variables`

2. **Add Required Variables**
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` - Get this from your Static Web App
   - `AZURE_SUBSCRIPTION_ID` - Your Azure subscription ID
   - `RESOURCE_GROUP_NAME` - Your Azure resource group name

## Step 3: Create Azure Resources

### Backend App Service
1. **Create App Service Plan**
   - Name: `astral-aone-backend-plan`
   - OS: Windows
   - Pricing tier: B1 (Basic) or higher

2. **Create Web App**
   - Name: `astral-aone-backend`
   - Runtime stack: .NET 8
   - Region: Same as your resource group

### Frontend Static Web App
1. **Create Static Web App**
   - Name: `astral-aone-frontend`
   - Region: Same as your resource group
   - Build details: Skip for now (we'll deploy pre-built)

## Step 4: Get Static Web Apps Token

1. **In your Static Web App**
   - Go to **Configuration** → **Deployment tokens**
   - Copy the **deployment token**
   - Add it to your pipeline variables as `AZURE_STATIC_WEB_APPS_API_TOKEN`

## Step 5: Update Pipeline Variables

1. **In your pipeline**
   - Go to **Edit** → **Variables**
   - Add the variable group you created
   - Or add variables directly to the pipeline

## Step 6: Test the Pipeline

1. **Run the pipeline**
   - It should now build successfully
   - The deploy stage should work with the correct service connection

## Troubleshooting

### Common Issues:
- **Service connection not found**: Make sure the name matches exactly
- **Authorization failed**: Check if the service principal has proper permissions
- **Build fails**: Check if all dependencies are properly referenced
- **Deploy fails**: Verify the Azure resources exist and are accessible

### Required Permissions:
The service principal needs these roles:
- **Contributor** on the resource group
- **Web Plan Contributor** for App Service
- **Static Web App Contributor** for Static Web Apps

## Next Steps After Deployment

1. **Configure CORS** in your backend for the frontend domain
2. **Set up custom domains** if needed
3. **Configure SSL certificates**
4. **Set up monitoring and logging**
5. **Configure CI/CD triggers** (branch policies, etc.)
