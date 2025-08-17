using AccountSalesApp.WebApp.Data;
using AccountSalesApp.WebApp.Models;
using AccountSalesApp.WebApp.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- Service Configuration ---

// 1. Add services for controllers (our new API)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Handle circular references in JSON serialization
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.MaxDepth = 64;
    });

// 2. Add Swagger for API documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. Configure the Database and Data Service (this stays the same)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
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
try
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        dbContext.Database.Migrate();
        
        // Seed the database with sample data if it's empty
        if (!dbContext.Customers.Any())
        {
            SeedDatabase(dbContext);
        }
        
        // Seed admin user if no users exist
        if (!dbContext.Users.Any())
        {
            SeedAdminUser(dbContext);
        }
        
        // Add sample invoices if none exist (AFTER customers are seeded)
        if (!dbContext.Invoices.Any() && dbContext.Customers.Any())
        {
            SeedSampleInvoices(dbContext);
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Database seeding error: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    // Continue running the app even if seeding fails
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
    Console.WriteLine($"Seeded {customers.Count} customers");
    
    // Add sample sales
    var sales = new List<Sale>
    {
        // Acme Corporation - Multiple sales totaling ~$9,277
        new Sale { CustomerId = 1, Amount = 3500, SaleDate = DateTime.UtcNow.AddDays(-45), Description = "Software License" },
        new Sale { CustomerId = 1, Amount = 2200, SaleDate = DateTime.UtcNow.AddDays(-30), Description = "Consulting Services" },
        new Sale { CustomerId = 1, Amount = 1800, SaleDate = DateTime.UtcNow.AddDays(-20), Description = "Training Program" },
        new Sale { CustomerId = 1, Amount = 1777, SaleDate = DateTime.UtcNow.AddDays(-10), Description = "Support Contract" },
        
        // TechStart Inc - Multiple sales totaling ~$8,858
        new Sale { CustomerId = 2, Amount = 4200, SaleDate = DateTime.UtcNow.AddDays(-40), Description = "Hardware Equipment" },
        new Sale { CustomerId = 2, Amount = 2800, SaleDate = DateTime.UtcNow.AddDays(-25), Description = "Software License" },
        new Sale { CustomerId = 2, Amount = 1858, SaleDate = DateTime.UtcNow.AddDays(-15), Description = "Consulting Services" },
        
        // Global Solutions - Multiple sales totaling ~$9,974
        new Sale { CustomerId = 3, Amount = 3800, SaleDate = DateTime.UtcNow.AddDays(-35), Description = "Training Program" },
        new Sale { CustomerId = 3, Amount = 3200, SaleDate = DateTime.UtcNow.AddDays(-25), Description = "Software License" },
        new Sale { CustomerId = 3, Amount = 1974, SaleDate = DateTime.UtcNow.AddDays(-15), Description = "Support Contract" },
        new Sale { CustomerId = 3, Amount = 1000, SaleDate = DateTime.UtcNow.AddDays(-5), Description = "Consulting Services" },
        
        // Peak Industries - Multiple sales totaling ~$6,515
        new Sale { CustomerId = 4, Amount = 2500, SaleDate = DateTime.UtcNow.AddDays(-30), Description = "Hardware Equipment" },
        new Sale { CustomerId = 4, Amount = 2000, SaleDate = DateTime.UtcNow.AddDays(-20), Description = "Software License" },
        new Sale { CustomerId = 4, Amount = 2015, SaleDate = DateTime.UtcNow.AddDays(-10), Description = "Training Program" },
        
        // Coastal Enterprises - Multiple sales totaling ~$432
        new Sale { CustomerId = 5, Amount = 432, SaleDate = DateTime.UtcNow.AddDays(-5), Description = "Support Contract" }
    };
    
    context.Sales.AddRange(sales);
    context.SaveChanges();
    Console.WriteLine($"Seeded {sales.Count} sales");
    
    // Add sample products and services
    var products = new List<Product>
    {
        // Products
        new Product 
        { 
            Name = "Professional Software License", 
            SKU = "PROD-SW-001", 
            Type = "Product", 
            Category = "Software", 
            Description = "Enterprise software license for business use", 
            Price = 299.99m, 
            Cost = 150.00m, 
            Stock = 100, 
            MinStock = 20, 
            Status = "Active",
            ImageUrl = "https://via.placeholder.com/60x60?text=SW"
        },
        new Product 
        { 
            Name = "Hardware Equipment", 
            SKU = "PROD-HW-001", 
            Type = "Product", 
            Category = "Hardware", 
            Description = "High-performance computing hardware", 
            Price = 899.99m, 
            Cost = 450.00m, 
            Stock = 25, 
            MinStock = 5, 
            Status = "Active",
            ImageUrl = "https://via.placeholder.com/60x60?text=HW"
        },
        new Product 
        { 
            Name = "Training Materials", 
            SKU = "PROD-TR-001", 
            Type = "Product", 
            Category = "Training", 
            Description = "Comprehensive training materials and guides", 
            Price = 149.99m, 
            Cost = 75.00m, 
            Stock = 50, 
            MinStock = 10, 
            Status = "Active",
            ImageUrl = "https://via.placeholder.com/60x60?text=TR"
        },
        
        // Services
        new Product 
        { 
            Name = "Consulting Services", 
            SKU = "SVC-CON-001", 
            Type = "Service", 
            Category = "Consulting", 
            Description = "Professional business consulting and advisory services", 
            Price = 150.00m, 
            Cost = 75.00m, 
            Stock = 0, 
            MinStock = 0, 
            Status = "Active",
            ImageUrl = "https://via.placeholder.com/60x60?text=CS"
        },
        new Product 
        { 
            Name = "Technical Support", 
            SKU = "SVC-SUP-001", 
            Type = "Service", 
            Category = "Support", 
            Description = "24/7 technical support and maintenance services", 
            Price = 89.99m, 
            Cost = 45.00m, 
            Stock = 0, 
            MinStock = 0, 
            Status = "Active",
            ImageUrl = "https://via.placeholder.com/60x60?text=TS"
        },
        new Product 
        { 
            Name = "Installation Service", 
            SKU = "SVC-INS-001", 
            Type = "Service", 
            Category = "Installation", 
            Description = "Professional installation and setup services", 
            Price = 120.00m, 
            Cost = 60.00m, 
            Stock = 0, 
            MinStock = 0, 
            Status = "Active",
            ImageUrl = "https://via.placeholder.com/60x60?text=IS"
        }
    };
    
    context.Products.AddRange(products);
    context.SaveChanges();
    Console.WriteLine($"Seeded {products.Count} products and services");
}

// Seed sample invoices
static void SeedSampleInvoices(ApplicationDbContext context)
{
    var sampleInvoices = new List<Invoice>
    {
        new Invoice 
        { 
            CustomerId = 1, 
            InvoiceNumber = "INV-2025-000001",
            InvoiceDate = DateTime.UtcNow.AddDays(-15),
            DueDate = DateTime.UtcNow.AddDays(15),
            Status = "Sent",
            SubTotal = 2500.00m,
            TaxRate = 10.0m,
            TaxAmount = 250.00m,
            DiscountAmount = 0,
            TotalAmount = 2750.00m,
            Notes = "Software licensing and setup",
            Terms = "Payment due within 30 days",
            Currency = "USD",
            Items = new List<InvoiceItem>
            {
                new InvoiceItem 
                { 
                    Description = "Software License (Annual)", 
                    Quantity = 1, 
                    UnitPrice = 2000.00m, 
                    LineTotal = 2000.00m,
                    Unit = "pcs",
                    ProductCode = "SW-LIC-001",
                    SortOrder = 0
                },
                new InvoiceItem 
                { 
                    Description = "Setup and Configuration", 
                    Quantity = 5, 
                    UnitPrice = 100.00m, 
                    LineTotal = 500.00m,
                    Unit = "hrs",
                    ProductCode = "SRV-SET-001",
                    SortOrder = 1
                }
            }
        },
        new Invoice 
        { 
            CustomerId = 2, 
            InvoiceNumber = "INV-2025-000002",
            InvoiceDate = DateTime.UtcNow.AddDays(-10),
            DueDate = DateTime.UtcNow.AddDays(20),
            Status = "Draft",
            SubTotal = 1800.00m,
            TaxRate = 8.0m,
            TaxAmount = 144.00m,
            DiscountAmount = 50.00m,
            TotalAmount = 1894.00m,
            Notes = "Hardware procurement and installation",
            Terms = "Payment due within 30 days",
            Currency = "USD",
            Items = new List<InvoiceItem>
            {
                new InvoiceItem 
                { 
                    Description = "Network Hardware", 
                    Quantity = 3, 
                    UnitPrice = 400.00m, 
                    LineTotal = 1200.00m,
                    Unit = "pcs",
                    ProductCode = "HW-NET-001",
                    SortOrder = 0
                },
                new InvoiceItem 
                { 
                    Description = "Installation Service", 
                    Quantity = 6, 
                    UnitPrice = 100.00m, 
                    LineTotal = 600.00m,
                    Unit = "hrs",
                    ProductCode = "SRV-INS-001",
                    SortOrder = 1
                }
            }
        }
    };
    
    context.Invoices.AddRange(sampleInvoices);
    context.SaveChanges();
    Console.WriteLine($"Seeded {sampleInvoices.Count} invoices");
}

// Seed admin user
static void SeedAdminUser(ApplicationDbContext context)
{
    var salt = Guid.NewGuid().ToString("N");
    var password = "admin123"; // Default admin password
    var hash = HashPassword(password, salt);
    
    var adminUser = new User
    {
        Name = "Administrator",
        Email = "admin@astralaone.com",
        PasswordHash = hash,
        PasswordSalt = salt,
        Status = "approved",
        Role = "admin",
        CreatedAt = DateTime.UtcNow,
        ApprovedAt = DateTime.UtcNow
    };
    
    context.Users.Add(adminUser);
    context.SaveChanges();
    
    Console.WriteLine("Admin user created:");
    Console.WriteLine($"Email: {adminUser.Email}");
    Console.WriteLine($"Password: {password}");
}

static string HashPassword(string password, string salt)
{
    using var sha256 = System.Security.Cryptography.SHA256.Create();
    var bytes = System.Text.Encoding.UTF8.GetBytes(password + ":" + salt);
    var hash = sha256.ComputeHash(bytes);
    return Convert.ToBase64String(hash);
}

app.Run();

// This is still needed for 'dotnet ef' tools
public partial class Program { }