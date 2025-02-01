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

                // Generate a unique salt
                string salt = GenerateSalt();

                // Hash password
                string hashedPassword = HashPassword(request.Password, salt);

                // create random userId for user registration to set the primary key of the User record
                int newUserId;
                do
                {
                    newUserId = new Random().Next(1, int.MaxValue); // Generate random positive int
                } while (await _context.Users.AnyAsync(u => u.UserId == newUserId)); // Ensure uniqueness


                // Create new user
                var user = new User
                {
                    UserId = newUserId,
                    Username = request.Username,
                    Email = request.Email,
                    Password = hashedPassword,
                    Salt = salt,
                    Role = request.Role,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = false
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
        private string HashPassword(string password, string salt)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] saltedPassword = Encoding.UTF8.GetBytes(password + salt); // Append salt to password
                byte[] hashedBytes = sha256.ComputeHash(saltedPassword);
                return Convert.ToHexString(hashedBytes); // Return hashed password as a hex string
            }
        }
                
        // methods for hashing password before saving it into the db
        private bool ValidatePassword(string enteredPassword, string storedHashedPassword, string salt)
        {
            string hashedEnteredPassword = HashPassword(enteredPassword, salt);
            return string.Equals(hashedEnteredPassword, storedHashedPassword, StringComparison.Ordinal);
        }


        private string GenerateSalt()
        {
            byte[] saltBytes = new byte[16]; // Generate a 16-byte salt
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(saltBytes);
            }
            return Convert.ToBase64String(saltBytes); // Convert to Base64 string for storage
        }

        // DTO for user registration
        public class RegisterUserDto
        {
            public string Username { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
            public string Role { get; set; }
        }
    }
}
 