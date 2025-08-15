using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AccountSalesApp.WebApp.Models;

public class InvoiceItem
{
    public int Id { get; set; }
    
    [Required]
    public int InvoiceId { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(10, 2)")]
    public decimal Quantity { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(18, 2)")]
    public decimal UnitPrice { get; set; }
    
    [Column(TypeName = "decimal(18, 2)")]
    public decimal LineTotal { get; set; }
    
    [StringLength(50)]
    public string? Unit { get; set; } // hours, pieces, kg, etc.
    
    [StringLength(100)]
    public string? ProductCode { get; set; }
    
    [Column(TypeName = "decimal(5, 2)")]
    public decimal TaxRate { get; set; } = 0;
    
    public int SortOrder { get; set; } = 0;
    
    // Navigation property
    public Invoice Invoice { get; set; } = null!;
}
