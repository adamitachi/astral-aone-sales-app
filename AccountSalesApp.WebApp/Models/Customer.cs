using System.ComponentModel.DataAnnotations;

namespace AccountSalesApp.WebApp.Models;

public class Customer
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; }

    [Phone]
    public string? PhoneNumber { get; set; }

    public DateTime DateCreated { get; set; } = DateTime.UtcNow;

    [StringLength(20)]
    public string Status { get; set; } = "active";

    public decimal TotalSpent { get; set; } = 0;

    // Navigation properties
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}