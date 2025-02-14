using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using static EnvironmentalPlatform_Sakellariou.Server.Controllers.UsersController;

namespace EnvironmentalPlatform_Sakellariou.Server.Controllers
{

    [Route("api/events")]
    [ApiController]
    [EnableCors("AllowAllOrigins")]
    public class EventsController : ControllerBase
    {
        private readonly SocialEnvironmentalPlatformContext _context;
        private readonly IConfiguration _config;

        public EventsController(SocialEnvironmentalPlatformContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // POST: api/Events/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventDTO eventDTO)
        {
            if (eventDTO == null)
            {
                return BadRequest(new { error = "Event data is required." });
            }

            try
            {
                // Generate a unique EventId
                int newEventId;
                do
                {
                    newEventId = new Random().Next(100000, 999999); // 6-digit unique ID
                } while (_context.Events.Any(e => e.EventId == newEventId));

                // Get OrgId from the currently logged-in user
                var orgIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (orgIdClaim == null)
                {
                    return Unauthorized("Organization ID not found.");
                }

                int orgId = int.Parse(orgIdClaim);

                // Create the new event
                var newEvent = new Event
                {
                    EventId = newEventId,
                    OrgId = orgId,
                    Title = eventDTO.Title,
                    Description = eventDTO.Description,
                    Location = eventDTO.Location,
                    Date = eventDTO.Date,
                    Requirements = eventDTO.Requirements,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                // Add the event to the database
                _context.Events.Add(newEvent);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Event created successfully", eventId = newEvent.EventId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while creating the event", details = ex.Message });
            }
        }


        public class CreateEventDTO
        {
            public string Title { get; set; }
            public string Description { get; set; }
            public string Location { get; set; }
            public DateTime Date { get; set; }
            public string Requirements { get; set; }
        }

        // Optional: Get a single event by id
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEventById(int id)
        {
            var eventItem = await _context.Events.FindAsync(id);

            if (eventItem == null)
            {
                return NotFound();
            }

            return eventItem;
        }
    }
}

