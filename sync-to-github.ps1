# Auto-sync script for GitHub
# Run this script to automatically commit and push your changes

param(
    [string]$CommitMessage = "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "🔄 Starting auto-sync to GitHub..." -ForegroundColor Cyan

# Check if there are any changes
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "✅ No changes to sync." -ForegroundColor Green
    exit 0
}

# Add all changes
Write-Host "📁 Adding changes..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m $CommitMessage

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push

Write-Host "✅ Successfully synced to GitHub!" -ForegroundColor Green
Write-Host "🔗 Repository: https://github.com/adamitachi/astral-aone-sales-app" -ForegroundColor Blue
