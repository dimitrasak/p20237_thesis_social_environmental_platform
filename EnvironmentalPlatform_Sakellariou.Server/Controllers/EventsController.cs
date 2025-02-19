using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using static EnvironmentalPlatform_Sakellariou.Server.Controllers.UsersController;
using static System.Net.Mime.MediaTypeNames;

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
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateEvent([FromForm] CreateEventDTO eventDTO, [FromForm] IFormFile image)
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

                string imagePath = null;

                // Handle the image file upload if present
                if (image != null)
                {
                    // Create a file name based on the event ID and original file extension
                    var fileName = $"{newEventId}_{Path.GetFileName(image.FileName)}";
                    var filePath = Path.Combine("C:\\Users\\User\\source\\repos\\EnvironmentalPlatform_Sakellariou\\p20237_thesis_social_environmental_platform\\EnvironmentalPlatform_Sakellariou.Server\\images\\events", fileName);

                    // Save the file to the specified path
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await image.CopyToAsync(stream);
                    }

                    imagePath = Path.Combine("\\images\\events", fileName); // Store relative path in database
                }

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
                    IsActive = true,
                    ImageUrl = imagePath
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

        [HttpGet("events")]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            //Response.Headers.Add("Cache-Control", "no-store");
            try
            {
                var events = await _context.Events
                    .AsNoTracking()
                    .Select(e => new {
                        e.EventId,
                        e.OrgId,
                        e.Title,
                        e.Description,
                        e.Location,
                        e.Date,
                        e.ImageUrl
                    }).ToListAsync();

                return Ok(events); 
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching events.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            try
            {
                // find the event by ID
                var eventToDelete = await _context.Events.FindAsync(id);

                if (eventToDelete == null)
                {
                    //the event doesn't exist, return a 404 Not Found
                    return NotFound(new { message = "Event not found." });
                }

                // Delete the event from the database
                _context.Events.Remove(eventToDelete);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Event deleted successfully." });
            }
            catch (Exception ex)
            {
                // 500 Internal Server Error if something goes wrong
                return StatusCode(500, new { message = "An error occurred while deleting the event.", error = ex.Message });
            }
        }


        // get a single event by id => Event Details preview page
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventById(int id)
        {
            try
            {
                var eventItem = await _context.Events.FindAsync(id);

                if (eventItem == null)
                {
                    return NotFound(new { message = "Event not found." });
                }

                return Ok(eventItem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the event.", error = ex.Message });
            }
        }


        // update method to edit event info 
        public class UpdateEventDTO
        {
            public string Title { get; set; }
            public string Description { get; set; }
            public string Location { get; set; }
            public DateTime Date { get; set; }
            public string Requirements { get; set; }
            //public string ImageUrl { get; set; } // Optional: handle image URL if updating the image
        }

        /* [HttpPut("{id}")]
         public async Task<IActionResult> UpdateEvent(int id, [FromBody] UpdateEventDTO eventDTO)
         {
             if (eventDTO == null)
             {
                 return BadRequest(new { error = "Event data is required." });
             }

             try
             {
                 // Find the event by ID
                 var eventToUpdate = await _context.Events.FindAsync(id);

                 if (eventToUpdate == null)
                 {
                     return NotFound(new { error = "Event not found." });
                 }

                 // Update event details
                 eventToUpdate.Title = eventDTO.Title;
                 eventToUpdate.Description = eventDTO.Description;
                 eventToUpdate.Location = eventDTO.Location;
                 eventToUpdate.Date = eventDTO.Date;
                 eventToUpdate.Requirements = eventDTO.Requirements;

                 // Optional: Update Image URL if it is included in the DTO
                 if (!string.IsNullOrEmpty(eventDTO.ImageUrl))
                 {
                     eventToUpdate.ImageUrl = eventDTO.ImageUrl;
                 }

                 // Save the updated event
                 _context.Events.Update(eventToUpdate);
                 await _context.SaveChangesAsync();

                 return Ok(new { message = "Event updated successfully", eventId = eventToUpdate.EventId });
             }
             catch (Exception ex)
             {
                 return StatusCode(500, new { message = "An error occurred while updating the event.", error = ex.Message });
             } 
         }*/
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateEvent(int id, [FromForm] UpdateEventDTO eventDTO, [FromForm] IFormFile? image)
        {
            if (!Request.HasFormContentType)
                return BadRequest(new { error = "Invalid content type. Expected multipart/form-data." });

            var eventToUpdate = await _context.Events.FindAsync(id);
            if (eventToUpdate == null) return NotFound(new { error = "Event not found." });

            eventToUpdate.Title = eventDTO.Title ?? eventToUpdate.Title;
            eventToUpdate.Description = eventDTO.Description ?? eventToUpdate.Description;
            eventToUpdate.Location = eventDTO.Location ?? eventToUpdate.Location;
            eventToUpdate.Date = eventDTO.Date != default ? eventDTO.Date : eventToUpdate.Date;
            eventToUpdate.Requirements = eventDTO.Requirements ?? eventToUpdate.Requirements;

            if (image != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "images/events");
                Directory.CreateDirectory(uploadsFolder);
                var fileName = $"{id}_{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                await using var stream = new FileStream(filePath, FileMode.Create);
                await image.CopyToAsync(stream);

                eventToUpdate.ImageUrl = filePath.Replace(Directory.GetCurrentDirectory(), "").Replace("\\", "/");
            }

            _context.Events.Update(eventToUpdate);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Event updated successfully", eventId = eventToUpdate.EventId });
        }
    }
}





