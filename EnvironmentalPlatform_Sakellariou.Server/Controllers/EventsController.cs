using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Security.Claims;
using static EnvironmentalPlatform_Sakellariou.Server.Controllers.CategoriesController;
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

                foreach (var categoryId in eventDTO.Categories)
                {
                    int newEventCatId;
                    do
                    {
                        newEventCatId = new Random().Next(100000, 999999); // Generate a new ID for each category
                    } while (_context.EventCategories.Any(e => e.EventCatId == newEventCatId));

                    var eventCategory = new EventCategory
                    {
                        EventCatId = newEventCatId, // Unique ID for each category
                        EventId = newEvent.EventId,
                        CatId = categoryId
                    };

                    _context.EventCategories.Add(eventCategory);
                }


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
            //public List<int> Categories { get; set; }
            [FromForm]
            public List<int> Categories { get; set; } = new List<int>();  // to insert in table EventCategories  

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
                // Find the event by ID
                var eventToDelete = await _context.Events
                    .Include(e => e.Posts)
                        .ThenInclude(p => p.Comments)
                    .Include(e => e.Reviews)
                    .Include(e => e.UserEventInterests)
                    .Include(e => e.EventCategories)
                    .FirstOrDefaultAsync(e => e.EventId == id);

                if (eventToDelete == null)
                {
                    return NotFound(new { message = "Event not found." });
                }

                //Delete all comments related to the event's posts
                foreach (var post in eventToDelete.Posts)
                {
                    _context.Comments.RemoveRange(post.Comments);
                }

                //Delete all posts related to the event
                _context.Posts.RemoveRange(eventToDelete.Posts);

                //Delete all reviews related to the event
                _context.Reviews.RemoveRange(eventToDelete.Reviews);

                //Delete all user-event interest records
                _context.UserEventInterests.RemoveRange(eventToDelete.UserEventInterests);

                //Delete all event-category relationships
                _context.EventCategories.RemoveRange(eventToDelete.EventCategories);

                //Delete the event itself
                _context.Events.Remove(eventToDelete);

                // Save all changes
                await _context.SaveChangesAsync();

                return Ok(new { message = "Event and all related data deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the event.", error = ex.Message });
            }
        }



        // get a single event by id => Event Details preview page
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventById(int id)
        {
            try
            {
                var eventItem = await _context.Events
                    .Where(e => e.EventId == id)
                    .Select(e => new
                    {
                        e.OrgId,
                        e.EventId,
                        e.Title,
                        e.Description,
                        e.Location,
                        e.Date,
                        e.Requirements,
                        e.ImageUrl,
                        eventCategories = _context.EventCategories
                            .Where(ec => ec.EventId == id)
                            .Select(ec => new
                            {
                                categoryId = ec.CatId,
                                name = ec.Cat.Name,
                                description = ec.Cat.Description
                            }).ToList()
                    })
                    .FirstOrDefaultAsync();

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

        //update method for Editing information of an event!
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateEvent(int id, [FromForm] UpdateEventDTO eventDTO, [FromForm] IFormFile? image, [FromForm] List<int> categories)
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

        //remove Category from Event => while updating info of an event => ( Edit Event jsx file)
        [HttpDelete("{eventId}/categories/{categoryId}")]
        public async Task<IActionResult> RemoveCategoryFromEvent(int eventId, int categoryId)
        {
            try
            {
                var eventCategory = await _context.EventCategories
                    .FirstOrDefaultAsync(ec => ec.EventId == eventId && ec.CatId == categoryId);

                if (eventCategory == null)
                {
                    return NotFound("Category not found for this event.");
                }

                _context.EventCategories.Remove(eventCategory);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Event Category removed successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while removing the category.", details = ex.Message });
            }
        }

        //add category to event => while updating info of an event => ( Edit Event jsx file)
        [HttpPost("{eventId}/categories")]
        public async Task<IActionResult> AddCategoryToEvent(int eventId, [FromBody] CategoryDTO categoryDto)
        {
            try
            {
                // Check if the category already exists for the event
                var existingCategory = await _context.EventCategories
                    .FirstOrDefaultAsync(ec => ec.EventId == eventId && ec.CatId == categoryDto.CategoryId);

                if (existingCategory != null)
                {
                    return BadRequest("Category already associated with this event.");
                }
                int newEventCatId;
                do
                {
                    newEventCatId = new Random().Next(100000, 999999); // Generate a new ID for each category
                } while (_context.EventCategories.Any(e => e.EventCatId == newEventCatId)); // Ensure it doesn't already exist

                var eventCategory = new EventCategory
                {
                    EventCatId = newEventCatId,
                    EventId = eventId,
                    CatId = categoryDto.CategoryId
                };

                _context.EventCategories.Add(eventCategory);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Event Category added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while adding the category.", details = ex.Message });
            }
        }

        public class CategoryDTO
        {
            public int CategoryId { get; set; }
        }



        /// <summary>
        /// probably to be deleting => see PostsController
        /// </summary>
        //create a new post under a specific event
        public class CreatePostDTO
        {
            public int? EventId { get; set; }
            public string PostContent { get; set; }
        }


        [HttpPost("create-post")]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostDTO postDTO)
        {
            if (postDTO == null || string.IsNullOrWhiteSpace(postDTO.PostContent))
            {
                return BadRequest(new { error = "Post content is required." });
            }

            try
            {
                // Generate a unique PostId
                int newPostId;
                do
                {
                    newPostId = new Random().Next(100000, 999999);
                } while (_context.Posts.Any(p => p.PostId == newPostId));

                // Get UserId from the currently logged-in user
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdClaim == null)
                {
                    return Unauthorized("User ID not found.");
                }

                int userId = int.Parse(userIdClaim);

                // Create the new post (without image)
                var newPost = new Post
                {
                    PostId = newPostId,
                    EventId = postDTO.EventId,
                    UserId = userId,
                    PostContent = postDTO.PostContent,
                    CreatedAt = DateTime.UtcNow
                };

                // Add the post to the database
                _context.Posts.Add(newPost);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Post created successfully", postId = newPost.PostId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while creating the post", details = ex.Message });
            }
        }

    }
}





