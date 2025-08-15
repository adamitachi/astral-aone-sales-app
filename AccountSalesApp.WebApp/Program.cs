using AccountSalesApp.WebApp.Data;
using AccountSalesApp.WebApp.Models;
using AccountSalesApp.WebApp.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- Service Configuration ---

// 1. Add services for controllers (our new API)
builder.Services.AddControllers();

// 2. Add Swagger for API documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. Configure the Database and Data Service (this stays the same)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));
builder.Services.AddScoped<AppDataService>();
builder.Services.AddScoped<InvoiceService>();

// 4. IMPORTANT: Add CORS policy to allow our Next.js app to connect
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextApp", policy =>
    {
        policy.WithOrigins("http://localhost:3001") // The address of our Next.js app
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// --- End Service Configuration ---


var app = builder.Build();

// --- Middleware Configuration ---

// Use Swagger in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // We can leave this off for local API dev

// Use the CORS policy we defined
app.UseCors("AllowNextApp");

app.UseAuthorization();

// This tells the app to use the routes defined in our controller
app.MapControllers();

// --- End Middleware Configuration ---

// This still runs the database migrations on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
    
    // Seed the database with sample data if it's empty
    if (!dbContext.Customers.Any())
    {
        SeedDatabase(dbContext);
    }
}

// Seed the database with sample data
static void SeedDatabase(ApplicationDbContext context)
{
    // Add sample customers
    var customers = new List<Customer>
    {
        new Customer { Name = "Acme Corporation", Email = "contact@acme.com", PhoneNumber = "+1-555-0101", Status = "active" },
        new Customer { Name = "TechStart Inc", Email = "hello@techstart.com", PhoneNumber = "+1-555-0102", Status = "inactive" },
        new Customer { Name = "Global Solutions", Email = "info@globalsolutions.com", PhoneNumber = "+1-555-0103", Status = "active" },
        new Customer { Name = "Peak Industries", Email = "sales@peakindustries.com", PhoneNumber = "+1-555-0104", Status = "inactive" },
        new Customer { Name = "Coastal Enterprises", Email = "contact@coastal.com", PhoneNumber = "+1-555-0105", Status = "active" }
    };
    
    context.Customers.AddRange(customers);
    context.SaveChanges();
    
    // Add sample sales
    var sales = new List<Sale>
    {
        // Acme Corporation - Multiple sales totaling ~$9,277
        new Sale { CustomerId = 1, Amount = 3500, SaleDate = DateTime.Now.AddDays(-45), Description = "Software License" },
        new Sale { CustomerId = 1, Amount = 2200, SaleDate = DateTime.Now.AddDays(-30), Description = "Consulting Services" },
        new Sale { CustomerId = 1, Amount = 1800, SaleDate = DateTime.Now.AddDays(-20), Description = "Training Program" },
        new Sale { CustomerId = 1, Amount = 1777, SaleDate = DateTime.Now.AddDays(-10), Description = "Support Contract" },
        
        // TechStart Inc - Multiple sales totaling ~$8,858
        new Sale { CustomerId = 2, Amount = 4200, SaleDate = DateTime.Now.AddDays(-40), Description = "Hardware Equipment" },
        new Sale { CustomerId = 2, Amount = 2800, SaleDate = DateTime.Now.AddDays(-25), Description = "Software License" },
        new Sale { CustomerId = 2, Amount = 1858, SaleDate = DateTime.Now.AddDays(-15), Description = "Consulting Services" },
        
        // Global Solutions - Multiple sales totaling ~$9,974
        new Sale { CustomerId = 3, Amount = 3800, SaleDate = DateTime.Now.AddDays(-35), Description = "Training Program" },
        new Sale { CustomerId = 3, Amount = 3200, SaleDate = DateTime.Now.AddDays(-25), Description = "Software License" },
        new Sale { CustomerId = 3, Amount = 1974, SaleDate = DateTime.Now.AddDays(-15), Description = "Support Contract" },
        new Sale { CustomerId = 3, Amount = 1000, SaleDate = DateTime.Now.AddDays(-5), Description = "Consulting Services" },
        
        // Peak Industries - Multiple sales totaling ~$6,515
        new Sale { CustomerId = 4, Amount = 2500, SaleDate = DateTime.Now.AddDays(-30), Description = "Hardware Equipment" },
        new Sale { CustomerId = 4, Amount = 2000, SaleDate = DateTime.Now.AddDays(-20), Description = "Software License" },
        new Sale { CustomerId = 4, Amount = 2015, SaleDate = DateTime.Now.AddDays(-10), Description = "Training Program" },
        
        // Coastal Enterprises - Multiple sales totaling ~$432
        new Sale { CustomerId = 5, Amount = 432, SaleDate = DateTime.Now.AddDays(-5), Description = "Support Contract" }
    };
    
    context.Sales.AddRange(sales);
    context.SaveChanges();
}

app.Run();

// This is still needed for 'dotnet ef' tools
public partial class Program { }