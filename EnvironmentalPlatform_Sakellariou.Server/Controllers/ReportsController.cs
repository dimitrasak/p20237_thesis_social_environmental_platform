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
        public async Task<IActionResult> AcceptReport(int id)
        {
            var report = await _context.Reports
                .Include(r => r.Post)
                    .ThenInclude(p => p.Comments)
                .Include(r => r.Comment)
                .FirstOrDefaultAsync(r => r.ReportId == id);

            if (report == null)
                return NotFound();

            if (report.CommentId != null)
            {
                var commentId = report.CommentId.Value;

                // Delete all reports associated with this comment
                var relatedReports = _context.Reports.Where(r => r.CommentId == commentId);
                _context.Reports.RemoveRange(relatedReports);
                await _context.SaveChangesAsync(); // Ensure reports are deleted before the comment

                // Delete the comment
                var comment = await _context.Comments.FirstOrDefaultAsync(c => c.CommentId == commentId);
                if (comment != null)
                {
                    _context.Comments.Remove(comment);
                    await _context.SaveChangesAsync();
                }
            }
            else if (report.PostId != null)
            {
                var postId = report.PostId.Value;

                // Load the post with its comments
                var post = await _context.Posts
                    .Include(p => p.Comments)
                    .FirstOrDefaultAsync(p => p.PostId == postId);

                if (post != null)
                {
                    var commentIds = post.Comments.Select(c => c.CommentId).ToList();

                    // Delete all reports related to this post and its comments
                    var relatedReports = _context.Reports
                        .Where(r => r.PostId == postId || (r.CommentId != null && commentIds.Contains(r.CommentId.Value)));
                    _context.Reports.RemoveRange(relatedReports);
                    await _context.SaveChangesAsync(); // Ensure reports are deleted first

                    // Delete comments under the post
                    if (post.Comments.Any())
                    {
                        _context.Comments.RemoveRange(post.Comments);
                    }

                    // Delete the post
                    _context.Posts.Remove(post);
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { message = "Report accepted and related content deleted." });
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

        //for admin dashboard
        // GET: api/reports/pending-count
        [HttpGet("pending-count")]
        public async Task<IActionResult> GetPendingReportsCount()
        {
            var count = await _context.Reports
                .Where(r => r.Status == "Pending")
                .CountAsync();

            return Ok(count);
        }

        // GET: api/reports/status-over-time
        [HttpGet("status-over-time")]
        public async Task<IActionResult> GetReportsStatusOverTime()
        {
            var reportStatsRaw = await _context.Reports
                .Where(r => r.CreatedAt.HasValue)
                .GroupBy(r => new { Date = r.CreatedAt.Value.Date, r.Status })
                .Select(g => new
                {
                    Date = g.Key.Date,  // keep as DateTime here
                    Status = g.Key.Status,
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            // Now do the formatting client-side
            var reportStatsFormatted = reportStatsRaw
                .Select(r => new
                {
                    Date = r.Date.ToString("yyyy-MM-dd"),
                    Status = r.Status,
                    Count = r.Count
                })
                .ToList();

            return Ok(reportStatsFormatted);
        }






    }
}
  