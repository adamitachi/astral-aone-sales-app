using System.ComponentModel.DataAnnotations;

namespace AccountSalesApp.WebApp.Models;

public class CreateInvoiceDto
{
    [Required]
    public int CustomerId { get; set; }
    
    [Required]
    public DateTime InvoiceDate { get; set; }
    
    [Required]
    public DateTime DueDate { get; set; }
    
    public string Status { get; set; } = "Draft";
    public decimal SubTotal { get; set; }
    public decimal TaxRate { get; set; } = 0;
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public string? Terms { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal PaidAmount { get; set; } = 0;
    public List<CreateInvoiceItemDto> Items { get; set; } = new();
}

public class CreateInvoiceItemDto
{
    [Required]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public decimal Quantity { get; set; }
    
    [Required]
    public decimal UnitPrice { get; set; }
    
    public decimal LineTotal { get; set; }
    public string? Unit { get; set; }
    public string? ProductCode { get; set; }
    public decimal TaxRate { get; set; } = 0;
    public int SortOrder { get; set; } = 0;
}
