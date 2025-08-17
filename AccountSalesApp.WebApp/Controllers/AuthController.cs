using AccountSalesApp.WebApp.Data;
using AccountSalesApp.WebApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace AccountSalesApp.WebApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context)
    {
        _context = context;
    }

    public record RegisterRequest(string Name, string Email, string Password);
    public record LoginRequest(string Email, string Password);
    public record AuthUser(int Id, string Name, string Email, string Role, string Status);
    public record AuthResponse(string Token, AuthUser User, string Message);
    public record ApproveUserRequest(int UserId, bool Approve, string? Reason = null);
    public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Name, email and password are required");
        }

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (existingUser != null)
        {
            return Conflict("User with this email already exists");
        }

        var salt = Guid.NewGuid().ToString("N");
        var hash = HashPassword(request.Password, salt);

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = request.Email.Trim().ToLower(),
            PasswordSalt = salt,
            PasswordHash = hash,
            Status = "pending",
            Role = "user",
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var authUser = new AuthUser(user.Id, user.Name, user.Email, user.Role, user.Status);
        return Ok(new AuthResponse("", authUser, "Registration successful. Please wait for admin approval."));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user == null)
        {
            return Unauthorized("Invalid email or password");
        }

        var hash = HashPassword(request.Password, user.PasswordSalt);
        if (!CryptographicEquals(hash, user.PasswordHash))
        {
            return Unauthorized("Invalid email or password");
        }

        if (user.Status != "approved")
        {
            var message = user.Status == "pending" 
                ? "Your account is pending admin approval" 
                : user.Status == "rejected" 
                    ? $"Your account has been rejected. Reason: {user.RejectionReason}"
                    : "Your account is not active";
            
            var authUser = new AuthUser(user.Id, user.Name, user.Email, user.Role, user.Status);
            return Ok(new AuthResponse("", authUser, message));
        }

        var token = GenerateToken(user);
        var approvedUser = new AuthUser(user.Id, user.Name, user.Email, user.Role, user.Status);
        return Ok(new AuthResponse(token, approvedUser, "Login successful"));
    }

    [HttpGet("pending-users")]
    public async Task<ActionResult<IEnumerable<AuthUser>>> GetPendingUsers()
    {
        // TODO: Add admin authentication check here
        var pendingUsers = await _context.Users
            .Where(u => u.Status == "pending")
            .Select(u => new AuthUser(u.Id, u.Name, u.Email, u.Role, u.Status))
            .ToListAsync();

        return Ok(pendingUsers);
    }

    [HttpPost("approve-user")]
    public async Task<IActionResult> ApproveUser([FromBody] ApproveUserRequest request)
    {
        // TODO: Add admin authentication check here
        var user = await _context.Users.FindAsync(request.UserId);
        if (user == null)
        {
            return NotFound("User not found");
        }

        if (request.Approve)
        {
            user.Status = "approved";
            user.ApprovedAt = DateTime.UtcNow;
            // TODO: Set ApprovedBy to current admin user ID
        }
        else
        {
            user.Status = "rejected";
            user.RejectionReason = request.Reason ?? "No reason provided";
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = request.Approve ? "User approved successfully" : "User rejected successfully" });
    }

    [HttpPost("verify-token")]
    public async Task<ActionResult<AuthUser>> VerifyToken([FromBody] string token)
    {
        try
        {
            var userId = DecodeToken(token);
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null || user.Status != "approved")
            {
                return Unauthorized("Invalid or expired token");
            }

            var authUser = new AuthUser(user.Id, user.Name, user.Email, user.Role, user.Status);
            return Ok(authUser);
        }
        catch
        {
            return Unauthorized("Invalid token");
        }
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, [FromHeader(Name = "Authorization")] string? authorization)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest("Current password and new password are required");
        }

        if (request.NewPassword.Length < 8)
        {
            return BadRequest("New password must be at least 8 characters long");
        }

        // Extract user ID from authorization header
        if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
        {
            return Unauthorized("Authorization token required");
        }

        var token = authorization.Substring("Bearer ".Length);
        int userId;
        
        try
        {
            userId = DecodeToken(token);
        }
        catch
        {
            return Unauthorized("Invalid token");
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null || user.Status != "approved")
        {
            return NotFound("User not found or not approved");
        }

        // Verify current password
        var currentPasswordHash = HashPassword(request.CurrentPassword, user.PasswordSalt);
        if (!CryptographicEquals(currentPasswordHash, user.PasswordHash))
        {
            return BadRequest("Current password is incorrect");
        }

        // Update password
        var newSalt = Guid.NewGuid().ToString("N");
        var newPasswordHash = HashPassword(request.NewPassword, newSalt);
        
        user.PasswordHash = newPasswordHash;
        user.PasswordSalt = newSalt;
        
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully" });
    }

    private static string HashPassword(string password, string salt)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password + ":" + salt);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    private static bool CryptographicEquals(string a, string b)
    {
        var aBytes = Encoding.UTF8.GetBytes(a);
        var bBytes = Encoding.UTF8.GetBytes(b);
        if (aBytes.Length != bBytes.Length) return false;
        var result = 0;
        for (int i = 0; i < aBytes.Length; i++) result |= aBytes[i] ^ bBytes[i];
        return result == 0;
    }

    private static string GenerateToken(User user)
    {
        // Simple token for development. In production, use JWT
        var tokenData = $"{user.Id}:{user.Email}:{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(tokenData));
    }

    private static int DecodeToken(string token)
    {
        var tokenData = Encoding.UTF8.GetString(Convert.FromBase64String(token));
        var parts = tokenData.Split(':');
        return int.Parse(parts[0]);
    }
}
