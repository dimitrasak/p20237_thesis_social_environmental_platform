using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EnvironmentalPlatform_Sakellariou.Server.Controllers
{
    [Route("api/reports")]
    [ApiController]
    [EnableCors("AllowAllOrigins")]
    public class ReportsController : ControllerBase
    {
        private readonly SocialEnvironmentalPlatformContext _context;

        public ReportsController(SocialEnvironmentalPlatformContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] ReportDto reportDto)
        {
            if (reportDto == null || (reportDto.PostId == null && reportDto.CommentId == null))
            {
                return BadRequest("Either PostId or CommentId must be provided.");
            }

            // Generate a unique ReportId
            int newReportId;
            do
            {
                newReportId = new Random().Next(100000, 999999); // 6-digit unique ID
            } while (_context.Reports.Any(r => r.ReportId == newReportId));

            var report = new Report
            {
                ReportId = newReportId,
                PostId = reportDto.PostId,
                CommentId = reportDto.CommentId,
                UserId = reportDto.UserId,
                Reason = reportDto.Reason,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Report submitted successfully." });
        }

        public class ReportDto
        {
            public int? PostId { get; set; }
            public int? CommentId { get; set; }
            public int UserId { get; set; }
            public string Reason { get; set; }
        }

        public class ReportDTO
        {
            public int ReportId { get; set; }
            public string? Reason { get; set; }
            public string? Status { get; set; }
            public DateTime? CreatedAt { get; set; }

            public int? PostId { get; set; }
            public string? PostContent { get; set; }
            public string? PostAuthorUsername { get; set; }
            public int? EventId { get; set; } 

            public int? CommentId { get; set; }
            public string? CommentContent { get; set; }
            public string? CommentAuthorUsername { get; set; }
            public string? ParentPostContent { get; set; }
            public string? ParentPostAuthorUsername { get; set; }
            public int? ParentPostEventId { get; set; } 

            public int? UserId { get; set; }
            public string? Username { get; set; } // reporter
        }



        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReportDTO>>> GetReports()
        {
            var reports = await _context.Reports
                .Include(r => r.User) // Reporter
                .Include(r => r.Post).ThenInclude(p => p.User) // Reported post + author
                .Include(r => r.Post).ThenInclude(p => p.Event) // Event for reported post
                .Include(r => r.Comment).ThenInclude(c => c.User) // Reported comment + author
                .Include(r => r.Comment).ThenInclude(c => c.Post).ThenInclude(p => p.User) // Parent post + author
                .Include(r => r.Comment).ThenInclude(c => c.Post).ThenInclude(p => p.Event) // Event for parent post
                .ToListAsync();

            var reportDtos = reports.Select(r => new ReportDTO
            {
                ReportId = r.ReportId,
                Reason = r.Reason,
                Status = r.Status,
                CreatedAt = r.CreatedAt,

                PostId = r.PostId,
                PostContent = r.Post?.PostContent,
                PostAuthorUsername = r.Post?.User?.Username,
                EventId = r.Post?.Event?.EventId,

                CommentId = r.CommentId,
                CommentContent = r.Comment?.CommentContent,
                CommentAuthorUsername = r.Comment?.User?.Username,
                ParentPostContent = r.Comment?.Post?.PostContent,
                ParentPostAuthorUsername = r.Comment?.Post?.User?.Username,
                ParentPostEventId = r.Comment?.Post?.Event?.EventId,

                UserId = r.UserId,
                Username = r.User?.Username
            }).ToList();

            return Ok(reportDtos);
        }



        [HttpPost("accept/{id}")]
        public IActionResult AcceptReport(int id)
        {
            var report = _context.Reports
                .Include(r => r.Post)
                .Include(r => r.Comment)
                .FirstOrDefault(r => r.ReportId == id);

            if (report == null)
                return NotFound();

            if (report.CommentId != null)
            {
                var commentId = report.CommentId.Value;

                // Delete all reports associated with this comment
                var relatedReports = _context.Reports.Where(r => r.CommentId == commentId);
                _context.Reports.RemoveRange(relatedReports);

                // Then delete the comment
                var comment = _context.Comments.FirstOrDefault(c => c.CommentId == commentId);
                if (comment != null)
                {
                    _context.Comments.Remove(comment);
                }
            }
            else if (report.PostId != null)
            {
                var postId = report.PostId.Value;

                // Delete all reports associated with this post
                var relatedReports = _context.Reports.Where(r => r.PostId == postId);
                _context.Reports.RemoveRange(relatedReports);

                // Then delete the post and its comments
                var post = _context.Posts.Include(p => p.Comments).FirstOrDefault(p => p.PostId == postId);
                if (post != null)
                {
                    if (post.Comments != null && post.Comments.Any())
                    {
                        _context.Comments.RemoveRange(post.Comments);
                    }

                    _context.Posts.Remove(post);
                }
            }

            _context.SaveChanges();
            return Ok();
        }




        [HttpPost("decline/{id}")]
        public IActionResult DeclineReport(int id)
        {
            var report = _context.Reports.Find(id);
            if (report == null) return NotFound();

            report.Status = "Declined";
            _context.SaveChanges();
            return Ok();
        }





    }
}
  