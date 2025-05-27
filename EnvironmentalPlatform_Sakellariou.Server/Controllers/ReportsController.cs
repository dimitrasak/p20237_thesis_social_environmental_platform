using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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


    }
}
  