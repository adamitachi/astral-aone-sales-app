using AccountSalesApp.WebApp.Data;
using AccountSalesApp.WebApp.Models;
using Microsoft.EntityFrameworkCore;

namespace AccountSalesApp.WebApp.Services;

public class InvoiceService
{
    private readonly ApplicationDbContext _context;

    public InvoiceService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Get all invoices with customer information
    public async Task<List<Invoice>> GetInvoicesAsync()
    {
        try
        {
            return await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Items)
                .Include(i => i.Payments)
                .OrderByDescending(i => i.InvoiceDate)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            // Log the error and return empty list instead of crashing
            Console.WriteLine($"Error fetching invoices: {ex.Message}");
            return new List<Invoice>();
        }
    }

    // Get invoice by ID with all related data
    public async Task<Invoice?> GetInvoiceByIdAsync(int id)
    {
        try
        {
            return await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Items.OrderBy(item => item.SortOrder))
                .Include(i => i.Payments.OrderBy(p => p.PaymentDate))
                .FirstOrDefaultAsync(i => i.Id == id);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching invoice by ID {id}: {ex.Message}");
            return null;
        }
    }

    // Get invoices for a specific customer
    public async Task<List<Invoice>> GetInvoicesByCustomerAsync(int customerId)
    {
        try
        {
            return await _context.Invoices
                .Include(i => i.Items)
                .Include(i => i.Payments)
                .Where(i => i.CustomerId == customerId)
                .OrderByDescending(i => i.InvoiceDate)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching invoices for customer {customerId}: {ex.Message}");
            return new List<Invoice>();
        }
    }

    // Create new invoice
    public async Task<Invoice> CreateInvoiceAsync(Invoice invoice)
    {
        // Generate invoice number if not provided
        if (string.IsNullOrEmpty(invoice.InvoiceNumber))
        {
            invoice.InvoiceNumber = await GenerateInvoiceNumberAsync();
        }

        // Ensure all DateTime values are in UTC for PostgreSQL
        invoice.InvoiceDate = DateTime.SpecifyKind(invoice.InvoiceDate, DateTimeKind.Utc);
        invoice.DueDate = DateTime.SpecifyKind(invoice.DueDate, DateTimeKind.Utc);
        invoice.CreatedAt = DateTime.UtcNow;
        invoice.UpdatedAt = DateTime.UtcNow;
        
        // Set PaidDate to UTC if it exists
        if (invoice.PaidDate.HasValue)
        {
            invoice.PaidDate = DateTime.SpecifyKind(invoice.PaidDate.Value, DateTimeKind.Utc);
        }

        // Calculate totals
        CalculateInvoiceTotals(invoice);

        // Entity Framework will automatically handle the relationship
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        return invoice;
    }

    // Update existing invoice
    public async Task<Invoice> UpdateInvoiceAsync(Invoice invoice)
    {
        invoice.UpdatedAt = DateTime.UtcNow;
        
        // Recalculate totals
        CalculateInvoiceTotals(invoice);

        _context.Entry(invoice).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return invoice;
    }

    // Delete invoice
    public async Task DeleteInvoiceAsync(int id)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice != null)
        {
            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();
        }
    }

    // Add payment to invoice
    public async Task<Payment> AddPaymentAsync(Payment payment)
    {
        // Generate payment number if not provided
        if (string.IsNullOrEmpty(payment.PaymentNumber))
        {
            payment.PaymentNumber = await GeneratePaymentNumberAsync();
        }

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        // Update invoice status and paid amount
        await UpdateInvoicePaymentStatusAsync(payment.InvoiceId);

        return payment;
    }

    // Get invoice statistics
    public async Task<InvoiceStatistics> GetInvoiceStatisticsAsync()
    {
        var invoices = await _context.Invoices.ToListAsync();
        
        return new InvoiceStatistics
        {
            TotalInvoices = invoices.Count,
            TotalAmount = invoices.Sum(i => i.TotalAmount),
            PaidAmount = invoices.Sum(i => i.PaidAmount),
            OutstandingAmount = invoices.Sum(i => i.TotalAmount - i.PaidAmount),
            OverdueCount = invoices.Count(i => i.DueDate < DateTime.UtcNow && i.Status != "Paid"),
            DraftCount = invoices.Count(i => i.Status == "Draft"),
            PaidCount = invoices.Count(i => i.Status == "Paid")
        };
    }

    // Private helper methods
    private void CalculateInvoiceTotals(Invoice invoice)
    {
        invoice.SubTotal = invoice.Items.Sum(item => item.LineTotal);
        invoice.TaxAmount = Math.Round(invoice.SubTotal * (invoice.TaxRate / 100), 2);
        invoice.TotalAmount = invoice.SubTotal + invoice.TaxAmount - invoice.DiscountAmount;

        // Calculate line totals for items
        foreach (var item in invoice.Items)
        {
            item.LineTotal = Math.Round(item.Quantity * item.UnitPrice, 2);
        }
    }

    private async Task<string> GenerateInvoiceNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var lastInvoice = await _context.Invoices
            .Where(i => i.InvoiceNumber.StartsWith($"INV-{year}"))
            .OrderByDescending(i => i.InvoiceNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastInvoice != null)
        {
            var parts = lastInvoice.InvoiceNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var currentNumber))
            {
                nextNumber = currentNumber + 1;
            }
        }

        return $"INV-{year}-{nextNumber:D6}";
    }

    private async Task<string> GeneratePaymentNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var lastPayment = await _context.Payments
            .Where(p => p.PaymentNumber.StartsWith($"PAY-{year}"))
            .OrderByDescending(p => p.PaymentNumber)
            .FirstOrDefaultAsync();

        var nextNumber = 1;
        if (lastPayment != null)
        {
            var parts = lastPayment.PaymentNumber.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var currentNumber))
            {
                nextNumber = currentNumber + 1;
            }
        }

        return $"PAY-{year}-{nextNumber:D6}";
    }

    private async Task UpdateInvoicePaymentStatusAsync(int invoiceId)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice != null)
        {
            invoice.PaidAmount = invoice.Payments.Sum(p => p.Amount);
            
            // Update status based on payment
            if (invoice.PaidAmount >= invoice.TotalAmount)
            {
                invoice.Status = "Paid";
                invoice.PaidDate = invoice.Payments.Max(p => p.PaymentDate);
            }
            else if (invoice.PaidAmount > 0)
            {
                invoice.Status = "Partial";
            }
            else if (invoice.DueDate < DateTime.UtcNow && invoice.Status != "Draft")
            {
                invoice.Status = "Overdue";
            }

            await _context.SaveChangesAsync();
        }
    }
}

// Statistics model
public class InvoiceStatistics
{
    public int TotalInvoices { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal OutstandingAmount { get; set; }
    public int OverdueCount { get; set; }
    public int DraftCount { get; set; }
    public int PaidCount { get; set; }
}
