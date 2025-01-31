using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace EnvironmentalPlatform_Sakellariou.Server.Controllers
{
    [Route("api/users")]
    [ApiController]
    [EnableCors("AllowAllOrigins")] 
    public class UsersController : ControllerBase
    {
        private readonly SocialEnvironmentalPlatformContext _context;

        public UsersController(SocialEnvironmentalPlatformContext context)
        {
            _context = context;
        }

        // POST: api/users/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { message = "Invalid request" });
                }

                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new { message = "Email and password are required" });
                }

                // Check if email already exists
                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                {
                    return BadRequest(new { message = "Email already in use" });
                }

                // Hash password
                string hashedPassword = HashPassword(request.Password);

                // Create new user
                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    Password = hashedPassword,  // Save hashed password
                    Role = request.Role,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "User registered successfully" });
            }
            catch (Exception ex)
            {
                // Log the error for debugging purposes
                // You could also log this error to a file or monitoring tool
                Console.Error.WriteLine($"Error registering user: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }


        // Utility method to hash password
        private string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToHexString(bytes); // Converts byte[] to hex string
            }
        }
    }

    // DTO for user registration
    public class RegisterUserDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }  // Example: "User" or "Admin"
    }
}
