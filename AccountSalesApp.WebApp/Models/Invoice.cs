using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AccountSalesApp.WebApp.Models;

public class Invoice
{
    public int Id { get; set; }
    
    [StringLength(50)]
    public string InvoiceNumber { get; set; } = string.Empty;
    
    [Required]
    public int CustomerId { get; set; }
    
    [Required]
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    
    [Required]
    public DateTime DueDate { get; set; }
    
    [StringLength(20)]
    public string Status { get; set; } = "Draft"; // Draft, Sent, Paid, Overdue, Cancelled
    
    [Column(TypeName = "decimal(18, 2)")]
    public decimal SubTotal { get; set; }
    
    [Column(TypeName = "decimal(5, 2)")]
    public decimal TaxRate { get; set; } = 0;
    
    [Column(TypeName = "decimal(18, 2)")]
    public decimal TaxAmount { get; set; }
    
    [Column(TypeName = "decimal(18, 2)")]
    public decimal DiscountAmount { get; set; } = 0;
    
    [Column(TypeName = "decimal(18, 2)")]
    public decimal TotalAmount { get; set; }
    
    [StringLength(1000)]
    public string? Notes { get; set; }
    
    [StringLength(500)]
    public string? Terms { get; set; }
    
    [StringLength(50)]
    public string Currency { get; set; } = "USD";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Payment tracking
    [Column(TypeName = "decimal(18, 2)")]
    public decimal PaidAmount { get; set; } = 0;
    
    public DateTime? PaidDate { get; set; }
    
    // Navigation properties
    public Customer Customer { get; set; } = null!;
    public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
