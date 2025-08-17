using System.ComponentModel.DataAnnotations;

namespace AccountSalesApp.WebApp.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public string PasswordSalt { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "pending"; // pending, approved, rejected

    [Required]
    [StringLength(20)]
    public string Role { get; set; } = "user"; // user, admin

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ApprovedAt { get; set; }

    public int? ApprovedBy { get; set; }

    public string? RejectionReason { get; set; }
}
