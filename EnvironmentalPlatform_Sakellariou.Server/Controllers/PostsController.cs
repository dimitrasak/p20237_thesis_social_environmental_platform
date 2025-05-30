using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static EnvironmentalPlatform_Sakellariou.Server.Controllers.EventsController;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Controllers
{
    [Route("api/posts")]
    [ApiController]
    [EnableCors("AllowAllOrigins")]
    public class PostsController : ControllerBase
    {
        private readonly SocialEnvironmentalPlatformContext _context;
        private readonly IConfiguration _config;

        public PostsController(SocialEnvironmentalPlatformContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        //create a new post
        [HttpPost("create")]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostDto postDto)
        {
            if (postDto == null || string.IsNullOrEmpty(postDto.PostContent))
            {
                return BadRequest(new { message = "Post content cannot be empty" });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User is not authenticated" });
            }

            int userId = int.Parse(userIdClaim.Value);

            int newPostId;
            do
            {
                newPostId = new Random().Next(100000, 999999); // 6-digit unique ID
            } while (_context.Posts.Any(e => e.PostId == newPostId));


            var newPost = new Post
            {
                PostId = newPostId,
                EventId = postDto.EventId,
                UserId = userId,
                PostContent = postDto.PostContent,
                CreatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(newPost);
            await _context.SaveChangesAsync();

            return Ok(newPost);
        }

        public class CreatePostDto
        {
            public int EventId { get; set; }
            public string PostContent { get; set; } = string.Empty;
        }

        //fetch all posts 
        [HttpGet("posts")]
        public async Task<ActionResult<IEnumerable<Post>>> GetPosts()
        {
            //Response.Headers.Add("Cache-Control", "no-store");
            try
            {
                var posts = await _context.Posts
                    .AsNoTracking()
                    .Select(e => new {
                        e.PostId,
                        e.EventId,
                        e.UserId,
                        e.PostContent,
                        e.CreatedAt,
                    }).ToListAsync();

                return Ok(posts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching events.", error = ex.Message });
            }
        }

        //retrive posts for a specific event based on eventId
        [HttpGet("event/{eventId}")]
        public async Task<IActionResult> GetPostsByEvent(int eventId)
        {
            var posts = await _context.Posts
                .Where(p => p.EventId == eventId)
                .Select(p => new
                {
                    p.PostId,
                    p.PostContent,
                    p.CreatedAt,
                    User = new
                    {
                        p.User.UserId,
                        Username = (p.User.IsActive == false) ? "Deactivated account" : p.User.Username,
                        ProfilePic = (p.User.IsActive == false || string.IsNullOrEmpty(p.User.ProfilePic))
                                ? "/default-profile.jpg"
                                : p.User.ProfilePic
                    }
                })
                .ToListAsync();

            return Ok(posts);
        }



    }
}
