using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EnvironmentalPlatform_Sakellariou.Server.Controllers
{
    [Route("api/comments")]
    [ApiController]
    [EnableCors("AllowAllOrigins")]
    public class CommentsController : ControllerBase
    {
        private readonly SocialEnvironmentalPlatformContext _context;

        public CommentsController(SocialEnvironmentalPlatformContext context)
        {
            _context = context;
        }

        // Add a comment to a post
        [HttpPost("create")]
        public async Task<IActionResult> AddComment([FromBody] CreateCommentDto commentDto)
        {
            if (string.IsNullOrEmpty(commentDto.CommentContent))
            {
                return BadRequest(new { message = "Comment content cannot be empty." });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User is not authenticated." });
            }

            int userId = int.Parse(userIdClaim.Value);

            int newCommentId;
            do
            {
                newCommentId = new Random().Next(100000, 999999); // 6-digit unique ID
            } while (_context.Comments.Any(e => e.CommentId == newCommentId));


            var comment = new Comment
            {
                CommentId = newCommentId,
                PostId = commentDto.PostId,
                UserId = userId,
                CommentContent = commentDto.CommentContent,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(comment);
        }

        public class CreateCommentDto
        {
            public int PostId { get; set; }
            public string CommentContent { get; set; }
        }

        // Get all comments for a specific post
        [HttpGet("post/{postId}")]
        public async Task<IActionResult> GetCommentsByPost(int postId)
        {
            var comments = await _context.Comments
                .Where(c => c.PostId == postId)
                .Select(c => new
                {
                    c.CommentId,
                    c.CommentContent,
                    c.CreatedAt,
                    User = new
                    {
                        c.User.Username,
                        ProfilePic = string.IsNullOrEmpty(c.User.ProfilePic)
                            ? "/default-profile.jpg" // Default image if profilePic is null or empty
                            : c.User.ProfilePic
                    }
                })
                .ToListAsync();

            return Ok(comments);
        }
    }
}
