using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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
        private readonly IConfiguration _config;

        public UsersController(SocialEnvironmentalPlatformContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == request.Username);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Validate the password
            if (!ValidatePassword(request.Password, user.Password, user.Salt))
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Generate JWT Token
            var token = GenerateJwtToken(user);
            Console.WriteLine($"Generated JWT: {token}");

            return Ok(new { token });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]));

            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Role, user.Role)
        };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpirationMinutes"])),
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        private bool ValidatePassword(string enteredPassword, string storedHashedPassword, string salt)
        {
            string hashedEnteredPassword = HashPassword(enteredPassword, salt);
            return string.Equals(hashedEnteredPassword, storedHashedPassword, StringComparison.Ordinal);
        }

        // DTO for login request
        public class LoginRequestDto
        {
            public string Username { get; set; }
            public string Password { get; set; }
        }





    }
}
 