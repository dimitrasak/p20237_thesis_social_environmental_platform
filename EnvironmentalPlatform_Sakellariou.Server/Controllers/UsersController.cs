using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.Blazor;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Channels;
using System.Threading.Tasks;
using JsonSerializer = System.Text.Json.JsonSerializer;

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
                    IsActive = true //κατα το registration ο χρήστης ορίζεται ως activated => automatoically
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                // Now create the role-specific record (RegularUser or Organisation) with null fields
                if (request.Role == "Regular User")
                {
                    var regularUser = new RegularUser
                    {
                        RegId = newUserId,
                        Name = null,
                        Surname = null,
                        Profession = null,
                        DateOfBirth = null
                    };
                    _context.RegularUsers.Add(regularUser);
                }
                else if (request.Role == "Organization")
                {
                    var organisation = new Organisation
                    {
                        OrganisationId = newUserId,
                        Name = null,
                        Afm = null,
                        Website = null,
                        Headquarters = null,
                        Aim = null,
                        LegalForm = null
                    };
                    _context.Organisations.Add(organisation);
                }

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

        // POST: api/users/login
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

            // Ensure profilePic is not null, and use 'default-profile.jpg' if null
            string profilePic = user.ProfilePic ?? "default-profile.jpg";

            return Ok(new { token, profilePic});
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

        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            int userId = int.Parse(userIdClaim.Value);

            // Fetch the user information first
            var user = await _context.Users
                .Include(u => u.RegularUser)  // Include related RegularUser information
                .Include(u => u.Organisation)  // Include related Organisation information
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            dynamic details = null;

            // Check the user's role and populate role-specific details
            if (user.RegularUser != null)
            {
                details = new
                {
                    user.RegularUser.Name,
                    user.RegularUser.Surname,
                    user.RegularUser.Profession,
                    user.RegularUser.DateOfBirth
                };
            }
            else if (user.Organisation != null)
            {
                details = new
                {
                    user.Organisation.Name,
                    user.Organisation.Afm,
                    user.Organisation.Website,
                    user.Organisation.Headquarters,
                    user.Organisation.Aim,
                    user.Organisation.LegalForm
                };
            }

            return Ok(new
            {
                user.UserId,
                user.Username,
                Email = user.Email,
                user.ProfilePic,
                Role = user.RegularUser != null ? "Regular User" : user.Organisation != null ? "Organization" : "Admin",
                Details = details
            });
        }


        //edit personal info for users based on role
        [HttpPut("update-profile/{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, [FromBody] JsonElement request)
        {
            try
            {
                var user = await _context.Users.SingleOrDefaultAsync(u => u.UserId == userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                Console.WriteLine($"Received data: {JsonConvert.SerializeObject(request)}");
                Console.WriteLine($"Raw JSON: {request.GetRawText()}");

                // Check user role and handle accordingly
                if (user.Role == "Regular User")
                {
                    // Deserialize the request to RegularUserProfileDto
                    var regularUserRequest = JsonSerializer.Deserialize<RegularUserProfileDto>(request.GetRawText());

                    if (regularUserRequest == null)
                    {
                        return BadRequest(new { message = "Invalid data for Regular User" });
                    }

                    var regularUser = await _context.RegularUsers.SingleOrDefaultAsync(r => r.RegId == userId);
                    if (regularUser == null)
                    {
                        return NotFound(new { message = "RegularUser details not found" });
                    }

                    Console.WriteLine("request data");
                    Console.WriteLine($"1: {regularUserRequest.Name}");
                    Console.WriteLine($"2: {regularUserRequest.Surname}");
                    Console.WriteLine($"3: {regularUserRequest.Profession}");
                    Console.WriteLine($"4: {regularUserRequest.DateOfBirth}");
                    // Update RegularUser specific fields
                    regularUser.Name = regularUserRequest.Name;
                    regularUser.Surname = regularUserRequest.Surname;
                    regularUser.Profession = regularUserRequest.Profession;
                    regularUser.DateOfBirth = regularUserRequest.DateOfBirth;

                    _context.RegularUsers.Update(regularUser);
                    _context.Entry(regularUser).State = EntityState.Modified;
                }
                else if (user.Role == "Organization")
                {
                    // Deserialize the request to OrganizationProfileDto
                    var organizationRequest = JsonSerializer.Deserialize<OrganizationProfileDto>(request.GetRawText());

                    if (organizationRequest == null)
                    {
                        return BadRequest(new { message = "Invalid data for Organization" });
                    }

                    var organization = await _context.Organisations.SingleOrDefaultAsync(o => o.OrganisationId == userId);
                    if (organization == null)
                    {
                        return NotFound(new { message = "Organisation details not found" });
                    }
                    Console.WriteLine("request data");
                    Console.WriteLine($"1: {organizationRequest.Name}");
                    Console.WriteLine($"2: {organizationRequest.Afm}");
                    Console.WriteLine($"3: {organizationRequest.Website}");
                    Console.WriteLine($"4: {organizationRequest.Headquarters}");
                    Console.WriteLine($"5: {organizationRequest.Aim}");
                    Console.WriteLine($"6: {organizationRequest.LegalForm}");

                    // Update Organisation specific fields
                    organization.Name = organizationRequest.Name;
                    organization.Afm = organizationRequest.Afm;
                    organization.Website = organizationRequest.Website;
                    organization.Headquarters = organizationRequest.Headquarters;
                    organization.Aim = organizationRequest.Aim;
                    organization.LegalForm = organizationRequest.LegalForm;

                    _context.Organisations.Update(organization);
                    _context.Entry(organization).State = EntityState.Modified;
                }

                int changes = await _context.SaveChangesAsync();
                Console.WriteLine($"Number of changes committed: {changes}");

                return Ok(new { message = "Profile updated successfully", changesCommitted = changes });
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error updating profile: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }

        // DTO for RegularUser
        public class RegularUserProfileDto
        {
            [JsonPropertyName("name")]
            public string Name { get; set; }

            [JsonPropertyName("surname")]
            public string Surname { get; set; }

            [JsonPropertyName("profession")]
            public string Profession { get; set; }

            [JsonPropertyName("dateOfBirth")]
            public string DateOfBirth { get; set; }
        }

        // DTO for Organization
        public class OrganizationProfileDto
        {
            [JsonPropertyName("name")]
            public string Name { get; set; }

            [JsonPropertyName("afm")]
            public int Afm { get; set; }

            [JsonPropertyName("website")]
            public string Website { get; set; }

            [JsonPropertyName("headquarters")]
            public string Headquarters { get; set; }

            [JsonPropertyName("aim")]
            public string Aim { get; set; }

            [JsonPropertyName("legalForm")]
            public string LegalForm { get; set; }
        }

        //delete user and all their data for GDPR reasons
        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteUserAsync(int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Load user and related data (excluding conversations/messages, since we handle those separately)
                var user = await _context.Users
                    .Include(u => u.Comments)
                    .Include(u => u.Posts)
                    .Include(u => u.Notifications)
                    .Include(u => u.Reviews)
                    .Include(u => u.UserEventInterests)
                    .Include(u => u.RegularUser)
                    .Include(u => u.Organisation)
                        .ThenInclude(o => o.Events)
                            .ThenInclude(e => e.EventCategories)
                    .Include(u => u.Organisation)
                        .ThenInclude(o => o.Events)
                            .ThenInclude(e => e.Posts)
                    .Include(u => u.Organisation)
                        .ThenInclude(o => o.Events)
                            .ThenInclude(e => e.Reviews)
                    .Include(u => u.Organisation)
                        .ThenInclude(o => o.Events)
                            .ThenInclude(e => e.UserEventInterests)
                    .FirstOrDefaultAsync(u => u.UserId == userId);

                if (user == null)
                    return NotFound(new { message = "User not found." });

                // Remove Comments, Posts, Notifications, Reviews, UserEventInterests
                // Delete all comments on posts created by the user
                var userPostIds = user.Posts.Select(p => p.PostId).ToList();
                var commentsOnUserPosts = _context.Comments
                    .Where(c => c.PostId.HasValue && userPostIds.Contains(c.PostId.Value));
                _context.Comments.RemoveRange(commentsOnUserPosts);

                // Delete user's authored comments (not tied to posts)
                _context.Comments.RemoveRange(user.Comments);

                // Delete user's posts
                _context.Posts.RemoveRange(user.Posts);

                _context.Notifications.RemoveRange(user.Notifications);
                _context.Reviews.RemoveRange(user.Reviews);
                _context.UserEventInterests.RemoveRange(user.UserEventInterests);

                // Remove RegularUser if exists
                if (user.RegularUser != null)
                    _context.RegularUsers.Remove(user.RegularUser);

                // Remove Organisation and related events and their linked data if exists
                if (user.Organisation != null)
                {
                    foreach (var evt in user.Organisation.Events)
                    {
                        _context.EventCategories.RemoveRange(evt.EventCategories);
                        _context.Posts.RemoveRange(evt.Posts);
                        _context.Reviews.RemoveRange(evt.Reviews);
                        _context.UserEventInterests.RemoveRange(evt.UserEventInterests);
                    }

                    _context.Events.RemoveRange(user.Organisation.Events);
                    _context.Organisations.Remove(user.Organisation);
                }

                // Nullify sender in messages before deleting user
                var messagesSentByUser = _context.Messages.Where(m => m.SenderId == userId);
                await messagesSentByUser.ForEachAsync(m => m.SenderId = null);

                // Remove user's participation in conversations
                var userParticipants = _context.ConvParticipants.Where(cp => cp.UserId == userId);
                _context.ConvParticipants.RemoveRange(userParticipants);

                // Remove related message read statuses if needed
                var userReadStatuses = _context.MessageReadStatuses.Where(mrs => mrs.UserId == userId);
                _context.MessageReadStatuses.RemoveRange(userReadStatuses);

                // Now remove the user
                _context.Users.Remove(user);


                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return NoContent(); // 204 No Content
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // Log exception as needed
                return StatusCode(500, new { message = "Error deleting user.", detail = ex.Message });
            }
        }

        // GET: Fetch all users
        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] bool onlyActive = false)
        {
            var query = _context.Users
                .Include(u => u.RegularUser)
                .Include(u => u.Organisation)
                .AsQueryable();

            if (onlyActive) // for findUsers jsx page,other users cannot visit profile of deactivated users, or send them a message
            {
                query = query.Where(u => u.IsActive == true);
            }

            var users = await query.ToListAsync();

            var result = users.Select(user =>
            {
                dynamic details = null;

                if (user.RegularUser != null)
                {
                    details = new
                    {
                        user.RegularUser.Name,
                        user.RegularUser.Surname,
                        user.RegularUser.Profession,
                        user.RegularUser.DateOfBirth
                    };
                }
                else if (user.Organisation != null)
                {
                    details = new
                    {
                        user.Organisation.Name,
                        user.Organisation.Afm,
                        user.Organisation.Website,
                        user.Organisation.Headquarters,
                        user.Organisation.Aim,
                        user.Organisation.LegalForm
                    };
                }

                return new
                {
                    user.UserId,
                    user.Username,
                    user.Email,
                    user.Role,
                    user.ProfilePic,
                    user.IsActive,
                    Details = details
                };
            });

            return Ok(result);
        }



        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(int userId)
        {
            var user = await _context.Users
                .Include(u => u.RegularUser)
                .Include(u => u.Organisation)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            dynamic details = null;

            if (user.RegularUser != null)
            {
                details = new
                {
                    user.RegularUser.Name,
                    user.RegularUser.Surname,
                    user.RegularUser.Profession,
                    user.RegularUser.DateOfBirth
                };
            }
            else if (user.Organisation != null)
            {
                details = new
                {
                    user.Organisation.Name,
                    user.Organisation.Afm,
                    user.Organisation.Website,
                    user.Organisation.Headquarters,
                    user.Organisation.Aim,
                    user.Organisation.LegalForm
                };
            }
            else if (user.Role == "Admin")
            {
                return Ok(new
                {
                    user.UserId,
                    user.Username,
                    user.ProfilePic,
                    user.Email,
                    Role = user.Role,
                    Contact = "For support, contact: admin@example.com or call +30 210 0000000"
                });
            }


            return Ok(new
            {
                user.UserId,
                user.Username,
                user.Email,
                user.ProfilePic,
                user.IsActive,
                role = user.Role,
                details = details
            });
        }

        //edit info of user through admin user management page
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] JsonElement dtoElement)
        {
            if (!dtoElement.TryGetProperty("username", out var usernameProp) ||
                !dtoElement.TryGetProperty("email", out var emailProp) ||
                !dtoElement.TryGetProperty("role", out var roleProp))
            {
                return BadRequest(new { message = "Missing required fields: username, email, or role." });
            }

            var username = usernameProp.GetString();
            var email = emailProp.GetString();
            var role = roleProp.GetString();

            var user = await _context.Users
                .Include(u => u.RegularUser)
                .Include(u => u.Organisation)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                return NotFound();

            user.Username = username;
            user.Email = email;
            user.Role = role;

            if (role == "Regular User")
            {
                if (!dtoElement.TryGetProperty("details", out var detailsProp))
                    return BadRequest(new { message = "Missing Regular User details" });

                var regularUserDetails = JsonSerializer.Deserialize<RegularUserProfileDto>(detailsProp.GetRawText());

                if (regularUserDetails == null)
                    return BadRequest(new { message = "Invalid Regular User details" });

                if (user.RegularUser == null)
                {
                    user.RegularUser = new RegularUser();
                    _context.RegularUsers.Add(user.RegularUser);
                }

                user.RegularUser.Name = regularUserDetails.Name;
                user.RegularUser.Surname = regularUserDetails.Surname;
                user.RegularUser.Profession = regularUserDetails.Profession;
                user.RegularUser.DateOfBirth = regularUserDetails.DateOfBirth;

                if (user.Organisation != null)
                {
                    _context.Organisations.Remove(user.Organisation);
                    user.Organisation = null;
                }
            }
            else if (role == "Organization")
            {
                if (!dtoElement.TryGetProperty("details", out var detailsProp))
                    return BadRequest(new { message = "Missing Organization details" });

                var organizationDetails = JsonSerializer.Deserialize<OrganizationProfileDto>(detailsProp.GetRawText());

                if (organizationDetails == null)
                    return BadRequest(new { message = "Invalid Organization details" });

                if (user.Organisation == null)
                {
                    user.Organisation = new Organisation();
                    _context.Organisations.Add(user.Organisation);
                }

                user.Organisation.Name = organizationDetails.Name;
                user.Organisation.Afm = organizationDetails.Afm;
                user.Organisation.Website = organizationDetails.Website;
                user.Organisation.Headquarters = organizationDetails.Headquarters;
                user.Organisation.Aim = organizationDetails.Aim;
                user.Organisation.LegalForm = organizationDetails.LegalForm;

                if (user.RegularUser != null)
                {
                    _context.RegularUsers.Remove(user.RegularUser);
                    user.RegularUser = null;
                }
            }
            else if (role == "Admin")
            {
                // Only update base user info
                if (user.RegularUser != null)
                {
                    _context.RegularUsers.Remove(user.RegularUser);
                    user.RegularUser = null;
                }

                if (user.Organisation != null)
                {
                    _context.Organisations.Remove(user.Organisation);
                    user.Organisation = null;
                }

                // No need for "details" — skip it
            }
            else
            {
                return BadRequest(new { message = "Role must be either 'Regular User', 'Organization', or 'Admin'" });
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }




        public class UserUpdateDto
        {
            public string Username { get; set; }
            public string Email { get; set; }
            public string Role { get; set; }

            // polymorphism
            public object Details { get; set; }
        }

        //for settings => change password, deactivate account
        [HttpPut("change-password/{userId}")]
        public async Task<IActionResult> ChangePassword(int userId, [FromBody] ChangePasswordDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Hash the current password with the stored salt
            var currentHashed = HashPassword(request.CurrentPassword, user.Salt);
            if (currentHashed != user.Password)
                return BadRequest(new { message = "Current password is incorrect." });

            // Generate new salt and hash
            var newSalt = GenerateSalt();
            var newHashed = HashPassword(request.NewPassword, newSalt);

            user.Salt = newSalt;
            user.Password = newHashed;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully." });
        }

        // DTO
        public class ChangePasswordDto
        {
            public string CurrentPassword { get; set; }
            public string NewPassword { get; set; }
        }

        //deactivate account temporarily
        [HttpPost("deactivate/{userId}")]
        public async Task<IActionResult> DeactivateAccount(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            user.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account has been deactivated." });
        }

        // Reactivate account
        [HttpPost("reactivate/{userId}")]
        public async Task<IActionResult> ReactivateAccount(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            user.IsActive = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account has been reactivated." });
        }

        //profile pics of users => upload 
        [HttpPost("{id}/upload-profile-pic")]
        public async Task<IActionResult> UploadProfilePic(int id, IFormFile profilePic)
        {
            if (profilePic == null || profilePic.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Optional: validate file type and size
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(profilePic.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Unsupported file type" });

            var uploadsFolder = @"C:\Users\User\source\repos\EnvironmentalPlatform_Sakellariou\p20237_thesis_social_environmental_platform\EnvironmentalPlatform_Sakellariou.Server\images\prof_pics\";
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await profilePic.CopyToAsync(stream);
            }

            user.ProfilePic = uniqueFileName;
            await _context.SaveChangesAsync();

            return Ok(new { profilePic = uniqueFileName });
        }

        //for admin dashboard
        // GET: api/users/users-signedup-last-7days
        [HttpGet("users-signedup-last-7days")]
        public async Task<IActionResult> GetUsersSignedUpLast7Days()
        {
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

            // Count users created in the last 7 days
            var count = await _context.Users
                .Where(u => u.CreatedAt >= sevenDaysAgo)
                .CountAsync();

            return Ok(count);
        }



    }
}
 