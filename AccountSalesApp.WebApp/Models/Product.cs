using System.ComponentModel.DataAnnotations;

namespace AccountSalesApp.WebApp.Models
{
    public class Product
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string SKU { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string Type { get; set; } = "Product"; // "Product" or "Service"
        
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal Cost { get; set; }
        
        [Range(0, int.MaxValue)]
        public int Stock { get; set; } = 0;
        
        [Range(0, int.MaxValue)]
        public int MinStock { get; set; } = 0;
        
        [StringLength(20)]
        public string Status { get; set; } = "Active"; // "Active", "Inactive", "Discontinued"
        
        [StringLength(200)]
        public string ImageUrl { get; set; } = string.Empty;
        
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;
        
        public DateTime? DateModified { get; set; }
        
        // For services, these fields might not apply
        public bool IsService => Type.Equals("Service", StringComparison.OrdinalIgnoreCase);
        
        // Navigation properties
        public virtual ICollection<Sale> Sales { get; set; } = new List<Sale>();
        public virtual ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
    }
}
