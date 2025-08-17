# Azure Deployment Script for Astral Aone Sales App
# This script will deploy the infrastructure and deploy the application

param(
    [string]$ResourceGroupName = "astral-aone-rg",
    [string]$Location = "East US",
    [string]$AppName = "astral-aone"
)

Write-Host "🚀 Starting Azure deployment for Astral Aone Sales App..." -ForegroundColor Green

# Check if Azure CLI is installed
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

# Check if logged in to Azure
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "🔐 Please log in to Azure..." -ForegroundColor Yellow
    az login
}

# Create Resource Group
Write-Host "📦 Creating Resource Group: $ResourceGroupName" -ForegroundColor Blue
az group create --name $ResourceGroupName --location $Location

# Deploy Infrastructure
Write-Host "🏗️ Deploying Azure infrastructure..." -ForegroundColor Blue
az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file "azure-infrastructure.json" `
    --parameters appName=$AppName location=$Location

# Get deployment outputs
Write-Host "📋 Getting deployment outputs..." -ForegroundColor Blue
$outputs = az deployment group show `
    --resource-group $ResourceGroupName `
    --name "azure-infrastructure" `
    --query "properties.outputs" | ConvertFrom-Json

$backendUrl = $outputs.backendUrl.value
$databaseServer = $outputs.databaseServer.value
$databaseName = $outputs.databaseName.value

Write-Host "✅ Infrastructure deployed successfully!" -ForegroundColor Green
Write-Host "🔗 Backend URL: $backendUrl" -ForegroundColor Cyan
Write-Host "🗄️ Database Server: $databaseServer" -ForegroundColor Cyan
Write-Host "📊 Database Name: $databaseName" -ForegroundColor Cyan

# Create Static Web App for Frontend
Write-Host "🌐 Creating Azure Static Web App for frontend..." -ForegroundColor Blue
az staticwebapp create `
    --name "$AppName-frontend" `
    --resource-group $ResourceGroupName `
    --source "https://github.com/yourusername/astral-aone-sales-app" `
    --branch "main" `
    --app-location "/account-sales-ui" `
    --output-location ".next" `
    --login-with-github

# Get Static Web App details
$staticWebApp = az staticwebapp show `
    --name "$AppName-frontend" `
    --resource-group $ResourceGroupName | ConvertFrom-Json

$frontendUrl = $staticWebApp.defaultHostname
Write-Host "🌐 Frontend URL: https://$frontendUrl" -ForegroundColor Cyan

# Update backend CORS to allow frontend
Write-Host "🔒 Updating backend CORS settings..." -ForegroundColor Blue
az webapp config cors add `
    --resource-group $ResourceGroupName `
    --name "$AppName-backend" `
    --allowed-origins "https://$frontendUrl"

# Create deployment script for Azure DevOps
Write-Host "📝 Creating Azure DevOps deployment configuration..." -ForegroundColor Blue

# Update the pipeline file with actual values
$pipelineContent = Get-Content "azure-pipelines.yml" -Raw
$pipelineContent = $pipelineContent -replace "Your-Azure-Subscription-Connection", "Azure-Subscription"
$pipelineContent = $pipelineContent -replace "astral-aone-backend", "$AppName-backend"
$pipelineContent = $pipelineContent -replace "astral-aone-frontend.azurestaticapps.net", "$frontendUrl"

Set-Content "azure-pipelines.yml" $pipelineContent

Write-Host "🎉 Deployment setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Push your code to Azure DevOps repository" -ForegroundColor White
Write-Host "2. Create a new pipeline using azure-pipelines.yml" -ForegroundColor White
Write-Host "3. Configure Azure service connection in Azure DevOps" -ForegroundColor White
Write-Host "4. Set up environment variables for database connection" -ForegroundColor White
Write-Host "5. Run the pipeline to deploy your application" -ForegroundColor White
Write-Host ""
Write-Host "🔗 URLs:" -ForegroundColor Yellow
Write-Host "Backend: $backendUrl" -ForegroundColor White
Write-Host "Frontend: https://$frontendUrl" -ForegroundColor White
Write-Host "Database: $databaseServer.database.windows.net" -ForegroundColor White
