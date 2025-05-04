using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Controllers
{
    [Route("api/reviews")]
    [ApiController]
    [EnableCors("AllowAllOrigins")]
    public class ReviewsController : ControllerBase
    {
        private readonly SocialEnvironmentalPlatformContext _context;

        public ReviewsController(SocialEnvironmentalPlatformContext context)
        {
            _context = context;
        }

        //2 different get methods depending on the role of the user currenly logged in
        // GET: api/reviews/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetReviewsCreatedByUser(int userId) //to fetch reviews for the loogged in regular user
        {
            var userReviews = await _context.Reviews
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.ReviewId,
                    r.Rating,
                    r.Comment,
                    ReviewedEntity = r.EventId != null
                        ? _context.Events.Where(e => e.EventId == r.EventId).Select(e => e.Title).FirstOrDefault()
                        : _context.Organisations
                            .Where(o => o.OrganisationId == r.OrgId)
                            .Select(o => o.Name + " (" + o.OrganisationNavigation.Username + ")")
                            .FirstOrDefault(),
                    EntityType = r.EventId != null ? "Event" : "Organization"
                })
                .ToListAsync();

            return Ok(userReviews);
        }



        // GET: api/Reviews/org/3
        [HttpGet("org/{orgId}")]  //to fetch events for currenly logged in organization
        public async Task<ActionResult<IEnumerable<object>>> GetReviewsByOrg(int orgId)
        {
            var orgReviews = await _context.Reviews
                .Where(r => r.OrgId == orgId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.ReviewId,
                    r.Rating,
                    r.Comment,
                    ReviewedEntity = r.EventId != null
                        ? _context.Events.Where(e => e.EventId == r.EventId).Select(e => e.Title).FirstOrDefault()
                        : _context.Organisations
                            .Where(o => o.OrganisationId == r.OrgId)
                            .Select(o => o.Name + " (" + o.OrganisationNavigation.Username + ")")
                            .FirstOrDefault(),
                    EntityType = r.EventId != null ? "Event" : "Organization"
                })
                .ToListAsync();

            return Ok(orgReviews);
        }


        // GET: api/Reviews/events
        [HttpGet("events")]   //to show names of the events in the dropdown, in modal window to create a new review
        public async Task<ActionResult<IEnumerable<Event>>> GetAllEvents()
        {
            return await _context.Events                
                .ToListAsync();
        }

        // GET: api/Reviews/organizations                
        [HttpGet("organizations")]      //to show name & username of the organizations available in the modal window to create a new review
        public async Task<ActionResult<IEnumerable<Organisation>>> GetOrganizationsWithUsernames()
        {
            // Fetch organizations with their associated user (username)
            var organizationsWithUsers = await _context.Organisations
                .Include(o => o.OrganisationNavigation)
                .Select(o => new
                {
                    o.OrganisationId,       
                    o.Name,                 
                    Username = o.OrganisationNavigation.Username 
                })
                .ToListAsync();

            // Return the result
            return Ok(organizationsWithUsers);
        }




        // POST: api/Reviews
        [HttpPost]
        public ActionResult<Review> AddReview([FromBody] ReviewDto reviewDto)
        {
            if (reviewDto == null || reviewDto.UserId == null)
            {
                return BadRequest("UserId is required.");
            }

            int newReviewId;
            var random = new Random();
            do
            {
                newReviewId = random.Next(100000, 999999); // 6-digit unique ID
            } while (_context.Reviews.Any(r => r.ReviewId == newReviewId));

            var review = new Review
            {
                ReviewId = newReviewId,
                UserId = reviewDto.UserId,
                EventId = reviewDto.EventId,
                OrgId = reviewDto.OrgId,
                Rating = reviewDto.Rating,
                Comment = reviewDto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetReviewById), new { id = review.ReviewId }, review);
        }

        // (Optional) If you want, you can have this to fetch single review
        [HttpGet("{id}")]
        public ActionResult<Review> GetReviewById(int id)
        {
            var review = _context.Reviews.Find(id);
            if (review == null)
            {
                return NotFound();
            }
            return review;
        }

        // DTO class
        public class ReviewDto
        {
            public int UserId { get; set; }
            public int? EventId { get; set; }
            public int? OrgId { get; set; }
            public string? Rating { get; set; }
            public string? Comment { get; set; }
        }

        //method that returns the attendees of the events that a specific organisation has created
        // GET: api/reviews/attendees/{orgId}
        [HttpGet("attendees/{orgId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetUsersWhoWillGoToOrgEvents(int orgId)
        {
            var attendees = await _context.UserEventInterests
                .Include(uei => uei.User)
                .Include(uei => uei.Event)
                .Where(uei =>
                    uei.InterestType == "I'll go" &&
                    uei.Event.OrgId == orgId)
                .Select(uei => new
                {
                    uei.User.UserId,
                    uei.User.Username,                    
                    EventTitle = uei.Event.Title
                })
                .Distinct()
                .ToListAsync();

            return Ok(attendees);
        }




    }
}
