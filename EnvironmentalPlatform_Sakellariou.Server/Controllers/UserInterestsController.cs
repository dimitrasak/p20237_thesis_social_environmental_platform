using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EnvironmentalPlatform_Sakellariou.Server.Controllers
{
    [Route("api/user-interests")]
    [ApiController]
    [EnableCors("AllowAllOrigins")]
    public class UserInterestsController : ControllerBase
    {
        private readonly SocialEnvironmentalPlatformContext _context;
        public UserInterestsController(SocialEnvironmentalPlatformContext context)
        {
            _context = context;
        }

        // Fetch user's interest in an event
        [HttpGet("{userId}/{eventId}")]
        public async Task<IActionResult> GetUserInterest(int userId, int eventId)
        {
            var interest = await _context.UserEventInterests
                .FirstOrDefaultAsync(i => i.UserId == userId && i.EventId == eventId);

            if (interest == null)
                return NotFound();

            return Ok(interest);
        }

        // Save or update interest
        [HttpPost]        
        public async Task<IActionResult> SaveUserInterest([FromBody] UserInterestDto interestDto)
        {
            if (interestDto == null || string.IsNullOrEmpty(interestDto.InterestType))
            {
                return BadRequest(new { message = "Interest type cannot be empty." });
            }

            // Get the authenticated user's ID from claims (if using authentication)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User is not authenticated." });
            }

            int userId = int.Parse(userIdClaim.Value);

            // Validate EventId
            /*if (interestDto.EventId <= 0)
            {
                return BadRequest(new { message = "Invalid EventId." });
            } */

            // Check if interest already exists
            var existingInterest = await _context.UserEventInterests
                .FirstOrDefaultAsync(i => i.UserId == userId && i.EventId == interestDto.EventId);

            if (existingInterest != null)
            {
                existingInterest.InterestType = interestDto.InterestType;
            }
            else
            {
                int newInterestId;
                do
                {
                    newInterestId = new Random().Next(100000, 999999); // Generate 6-digit unique InterestId
                } while (_context.UserEventInterests.Any(e => e.InterestId == newInterestId));

                var newInterest = new UserEventInterest
                {
                    InterestId = newInterestId,
                    UserId = userId,
                    EventId = interestDto.EventId,
                    InterestType = interestDto.InterestType,
                    CreatedAt = DateTime.UtcNow
                };

                _context.UserEventInterests.Add(newInterest);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Interest saved successfully." });
        }

        public class UserInterestDto
        {
            public int EventId { get; set; }
            public string InterestType { get; set; } = string.Empty;
        }


    }
}

