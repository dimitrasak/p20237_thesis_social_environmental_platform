using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Authorization;
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
        public async Task<IActionResult> GetCommentsByPost(int postId, [FromQuery] int? limit = null)
        {
            var query = _context.Comments
                .Include(c => c.User)
                .Where(c => c.PostId == postId)
                .OrderBy(c => c.CreatedAt) // oldest first
                .Select(c => new
                {
                    c.UserId,
                    c.PostId,
                    c.CommentId,
                    c.CommentContent,
                    c.CreatedAt,
                    User = new
                    {
                        Username = (c.User.IsActive == false) ? "Deactivated account" : c.User.Username,
                        ProfilePic = (c.User.IsActive == false || string.IsNullOrEmpty(c.User.ProfilePic))
                                    ? "/default-profile.jpg"
                                    : c.User.ProfilePic
                    }

                });

            if (limit.HasValue)
            {
                query = query.Take(limit.Value);
            }

            var comments = await query.ToListAsync();
            return Ok(comments);
        }


        // DELETE COMMENT
        [HttpDelete("delete/{commentId}")]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            // Try to get the userId from the claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User not authenticated." });
            }

            var userId = int.Parse(userIdClaim);

            var comment = await _context.Comments
                .Include(c => c.Post)
                .ThenInclude(p => p.Event) // Ensure the post's event is loaded
                .FirstOrDefaultAsync(c => c.CommentId == commentId);

            if (comment == null)
            {
                return NotFound(new { message = "Comment not found." });
            }

            // Check if user is authorized to delete
            bool isCommentOwner = comment.UserId == userId;
            bool isAdmin = userRole == "Admin";
            bool isEventOwner = comment.Post?.Event?.OrgId == userId;

            if (isCommentOwner || isAdmin || isEventOwner)
            {
                _context.Comments.Remove(comment);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Comment deleted successfully." });
            }

            return Forbid(); // User is not authorized
        }


        // EDIT COMMENT
        [HttpPut("edit/{commentId}")]
        public async Task<IActionResult> EditComment(int commentId, [FromBody] Comment updatedComment)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var comment = await _context.Comments
                .Include(c => c.Post)
                .ThenInclude(p => p.Event)
                .FirstOrDefaultAsync(c => c.CommentId == commentId);

            if (comment == null)
            {
                return NotFound(new { message = "Comment not found." });
            }

            // Authorization logic
            bool isCommentOwner = comment.UserId == userId;
            bool isAdmin = userRole == "Admin";
            bool isEventOwner = comment.Post?.Event?.OrgId == userId;

            if (isCommentOwner || isAdmin || isEventOwner)
            {
                comment.CommentContent = updatedComment.CommentContent; // Update content
                await _context.SaveChangesAsync();
                return Ok(new { message = "Comment updated successfully." });
            }

            return Forbid(); // User is not authorized
        }
    }
}
