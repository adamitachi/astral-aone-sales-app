using AccountSalesApp.WebApp.Models;
using Microsoft.EntityFrameworkCore;

namespace AccountSalesApp.WebApp.Data;

public class AppDataService
{
    private readonly ApplicationDbContext _context;

    public AppDataService(ApplicationDbContext context)
    {
        _context = context;
    }

    // --- Customer Methods ---
    public async Task<List<Customer>> GetCustomersAsync() 
    {
        try
        {
            var customers = await _context.Customers.ToListAsync();
            
            // Calculate total spent for each customer
            foreach (var customer in customers)
            {
                var sales = await _context.Sales
                    .Where(s => s.CustomerId == customer.Id)
                    .ToListAsync();
                customer.TotalSpent = sales.Sum(s => s.Amount);
            }
            
            return customers;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetCustomersAsync: {ex.Message}");
            // Return empty list on error
            return new List<Customer>();
        }
    }

    public async Task<Customer?> GetCustomerByIdAsync(int id) 
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer != null)
        {
            var sales = await _context.Sales
                .Where(s => s.CustomerId == customer.Id)
                .ToListAsync();
            customer.TotalSpent = sales.Sum(s => s.Amount);
        }
        return customer;
    }

    public async Task AddCustomerAsync(Customer customer)
    {
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateCustomerAsync(Customer customer)
    {
        _context.Entry(customer).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteCustomerAsync(int id)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer != null)
        {
            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
        }
    }

    // --- Sale Methods ---
    public async Task AddSaleAsync(Sale sale)
    {
        _context.Sales.Add(sale);
        await _context.SaveChangesAsync();
        
        // Update customer's total spent
        await UpdateCustomerTotalSpent(sale.CustomerId);
    }

    public async Task<List<Sale>> GetSalesByCustomerAsync(int customerId)
    {
        return await _context.Sales
            .Where(s => s.CustomerId == customerId)
            .OrderByDescending(s => s.SaleDate)
            .ToListAsync();
    }

    private async Task UpdateCustomerTotalSpent(int customerId)
    {
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer != null)
        {
            var totalSpent = await _context.Sales
                .Where(s => s.CustomerId == customerId)
                .SumAsync(s => s.Amount);
            customer.TotalSpent = totalSpent;
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteSaleAsync(int saleId)
    {
        var sale = await _context.Sales.FindAsync(saleId);
        if (sale != null)
        {
            var customerId = sale.CustomerId;
            _context.Sales.Remove(sale);
            await _context.SaveChangesAsync();
            
            // Update customer's total spent
            await UpdateCustomerTotalSpent(customerId);
        }
    }

    public async Task UpdateSaleAsync(Sale sale)
    {
        var originalSale = await _context.Sales.FindAsync(sale.Id);
        if (originalSale != null)
        {
            var customerId = originalSale.CustomerId;
            _context.Entry(originalSale).CurrentValues.SetValues(sale);
            await _context.SaveChangesAsync();
            
            // Update customer's total spent
            await UpdateCustomerTotalSpent(customerId);
        }
    }

    public async Task<List<Sale>> GetAllSalesAsync()
    {
        return await _context.Sales
            .OrderByDescending(s => s.SaleDate)
            .ToListAsync();
    }
}