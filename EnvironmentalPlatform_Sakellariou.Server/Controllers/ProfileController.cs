using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Controllers
{
    [Route("api/profile")]
    [ApiController]
    [EnableCors("AllowAllOrigins")]
    public class ProfileController : ControllerBase
    {
        private readonly SocialEnvironmentalPlatformContext _context;

        public ProfileController(SocialEnvironmentalPlatformContext context)
        {
            _context = context;
        }

        [HttpGet("stats/{userId}")]
        public IActionResult GetUserStatistics(int userId)
        {
            var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null) return NotFound("User not found");

            if (user.Role == "Regular User")
            {
                var goingInterests = _context.UserEventInterests
                    .Where(uei => uei.UserId == userId && uei.InterestType == "I'll go")
                    .Include(uei => uei.Event)
                    .ToList();

                var stats = new
                {
                    EventParticipationCount = goingInterests.Count,
                    ParticipatedEventNames = goingInterests.Select(e => e.Event.Title).ToList(),
                    ReviewsCount = _context.Reviews.Count(r => r.UserId == userId),
                    PostsCount = _context.Posts.Count(p => p.UserId == userId),
                    CommentsCount = _context.Comments.Count(c => c.UserId == userId),
                };
                return Ok(stats);
            }
            else if (user.Role == "Organization")
            {
                var org = _context.Organisations.FirstOrDefault(o => o.OrganisationId == user.UserId);
                if (org == null) return BadRequest("Organization profile not found");

                var orgReviews = _context.Reviews
                    .Where(r => r.OrgId == org.OrganisationId)
                    .ToList();

                var eventReviews = _context.Reviews
                    .Where(r => r.Event != null && r.Event.OrgId == org.OrganisationId)
                    .ToList();

                var allRatings = orgReviews.Concat(eventReviews)
                    .Where(r => double.TryParse(r.Rating, out _))
                    .Select(r => double.Parse(r.Rating))
                    .ToList();

                var events = _context.Events
                    .Where(e => e.OrgId == org.OrganisationId)
                    .Include(e => e.UserEventInterests)
                    .ToList();

                var eventAttendanceStats = events.Select(e => new
                {
                    e.Title,
                    Attendees = e.UserEventInterests.Count(uei => uei.InterestType == "I'll go")
                });

                var stats = new
                {
                    OrgAverageRating = orgReviews.Any() ? orgReviews.Average(r => double.Parse(r.Rating)) : 0,
                    EventAverageRating = eventReviews.Any() ? eventReviews.Average(r => double.Parse(r.Rating)) : 0,
                    GeneralAverageRating = allRatings.Any() ? allRatings.Average() : 0,
                    OrgComments = orgReviews.Select(r => r.Comment).ToList(),
                    EventComments = eventReviews.Select(r => r.Comment).ToList(),
                    TotalEventsOrganized = events.Count,
                    EventAttendance = eventAttendanceStats
                };

                return Ok(stats);
            }

            return BadRequest("Unknown user role");
        }
    }
}
   
