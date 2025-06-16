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

        [HttpPut("update/{postId}")]
        public async Task<IActionResult> EditPost(int postId, [FromBody] EditPostDto editDto)
        {
            if (editDto == null || string.IsNullOrWhiteSpace(editDto.PostContent))
            {
                return BadRequest(new { message = "Post content cannot be empty" });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User is not authenticated" });
            }

            int userId = int.Parse(userIdClaim.Value);

            var post = await _context.Posts.FindAsync(postId);
            if (post == null)
            {
                return NotFound(new { message = "Post not found" });
            }

            if (post.UserId != userId)
            {
                return Forbid(); // Only the post owner can edit
            }

            post.PostContent = editDto.PostContent;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Post updated successfully", post });
        }

        public class EditPostDto
        {
            public string PostContent { get; set; } = string.Empty;
        }

        [HttpDelete("delete/{postId}")]
        public async Task<IActionResult> DeletePost(int postId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User is not authenticated" });
            }

            int userId = int.Parse(userIdClaim.Value);

            var post = await _context.Posts
                .Include(p => p.Comments)
                .Include(p => p.Event)
                .FirstOrDefaultAsync(p => p.PostId == postId);

            if (post == null)
            {
                return NotFound(new { message = "Post not found" });
            }

            bool isOwner = post.UserId == userId;
            bool isEventOrganizer = post.Event?.OrgId == userId;

            if (!isOwner && !isEventOrganizer)
            {
                return Forbid(); // Not allowed to delete
            }

            // Delete reports related to the post itself
            var postReports = await _context.Reports
                .Where(r => r.PostId == postId)
                .ToListAsync();
            _context.Reports.RemoveRange(postReports);

            // Get all comment IDs for this post
            var commentIds = post.Comments?.Select(c => c.CommentId).ToList() ?? new List<int>();

            if (commentIds.Any())
            {
                // Delete reports referring to comments on the post
                var commentReports = await _context.Reports
                    .Where(r => commentIds.Contains(r.CommentId.Value))
                    .ToListAsync();
                _context.Reports.RemoveRange(commentReports);

                // Delete the comments themselves
                var comments = await _context.Comments
                    .Where(c => commentIds.Contains(c.CommentId))
                    .ToListAsync();
                _context.Comments.RemoveRange(comments);
            }

            // Finally, delete the post
            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Post, related comments, and reports deleted successfully" });
        }


        // for organization dashboard => number of posts made this week
        // GET: api/posts/event-post-count-by-organizer/{userId}
        [HttpGet("event-post-count-last-week/{userId}")]
        public async Task<ActionResult<int>> GetPostCountInOrganizedEventsLastWeek(int userId)
        {
            // Get last 7 days window
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);

            // Get events organized by the user
            var eventIds = await _context.Events
                .Where(e => e.OrgId == userId)
                .Select(e => e.EventId)
                .ToListAsync();

            if (!eventIds.Any())
                return Ok(0);

            // Count posts made in the last 7 days in those events
            var postCount = await _context.Posts
                .Where(p =>
                    eventIds.Contains(p.EventId ?? 0) &&
                    p.CreatedAt.HasValue &&
                    p.CreatedAt.Value >= oneWeekAgo)
                .CountAsync();

            return Ok(postCount);
        }

        //get all posts in the organization’s events
        // Get all posts in the organization’s events from the last 7 days
        [HttpGet("organization/{orgId}")]
        public async Task<IActionResult> GetRecentPostsByOrganization(int orgId)
        {
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);

            var eventIds = await _context.Events
                .Where(e => e.OrgId == orgId)
                .Select(e => e.EventId)
                .ToListAsync();

            var posts = await _context.Posts
                .Where(p => p.EventId != null &&
                            eventIds.Contains(p.EventId.Value) &&
                            p.CreatedAt >= oneWeekAgo)
                .Select(p => new
                {
                    p.PostId,
                    p.PostContent,
                    p.CreatedAt,
                    p.EventId,
                    EventTitle = p.Event.Title,
                    User = new
                    {
                        p.User.UserId,
                        Username = (p.User.IsActive == false) ? "Deactivated account" : p.User.Username,
                        ProfilePic = string.IsNullOrEmpty(p.User.ProfilePic) || p.User.IsActive == false
                                    ? "/default-profile.jpg"
                                    : p.User.ProfilePic
                    }
                })
                .ToListAsync();

            return Ok(posts);
        }


        //for reg user dashboard => show kinda notification under latest post, when they receive a new comment
        // GET: api/posts/user-recent/{userId}
        // Get posts made by user in last 7 days including comments
        
        [HttpGet("user-recent/{userId}")]
        public async Task<IActionResult> GetUserRecentPostsWithCommentsFromOthers(int userId)
        {
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);

            var posts = await _context.Posts
                .Where(p => p.UserId == userId && p.CreatedAt >= oneWeekAgo)
                .Select(p => new
                {
                    p.PostId,
                    p.PostContent,
                    p.CreatedAt,
                    p.EventId,
                    EventName = p.Event != null ? p.Event.Title : "No associated event",
                    Comments = p.Comments
                        .Where(c => c.UserId != userId)  // Exclude comments by the post owner
                        .Select(c => new
                        {
                            c.CommentId,
                            c.CommentContent,
                            c.CreatedAt,
                            User = new
                            {
                                c.User.UserId,
                                Username = (c.User.IsActive == false) ? "Deactivated account" : c.User.Username,
                                ProfilePic = (string.IsNullOrEmpty(c.User.ProfilePic) || c.User.IsActive == false)
                                            ? "/default-profile.jpg"
                                            : c.User.ProfilePic
                            }
                        })
                        .OrderBy(c => c.CreatedAt)
                        .ToList()
                })
                .ToListAsync();

            return Ok(posts);
        }








    }
}
