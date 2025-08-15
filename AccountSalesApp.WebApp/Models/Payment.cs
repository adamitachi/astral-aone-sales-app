using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AccountSalesApp.WebApp.Models;

public class Payment
{
    public int Id { get; set; }
    
    [Required]
    public int InvoiceId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string PaymentNumber { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(18, 2)")]
    public decimal Amount { get; set; }
    
    [Required]
    public DateTime PaymentDate { get; set; }
    
    [StringLength(50)]
    public string PaymentMethod { get; set; } = string.Empty; // Cash, Card, Bank Transfer, Check, etc.
    
    [StringLength(100)]
    public string? Reference { get; set; } // Transaction ID, Check number, etc.
    
    [StringLength(500)]
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public Invoice Invoice { get; set; } = null!;
}
