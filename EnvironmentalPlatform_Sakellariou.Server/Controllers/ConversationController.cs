using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Controllers
{
    [Route("api/conversation")]
    [ApiController]
    [EnableCors("AllowAllOrigins")]
    public class ConversationController : ControllerBase
    {
        private readonly SocialEnvironmentalPlatformContext _context;

        public ConversationController(SocialEnvironmentalPlatformContext context)
        {
            _context = context;
        }

        public class ConversationDTO
        {
            public int ConvId { get; set; }
            public DateTime CreatedAt { get; set; }
            public List<int> ParticipantIds { get; set; }
            public List<string> ParticipantUsernames { get; set; }
            public List<string> ParticipantProfilePictures { get; set; }
            public bool HasUnreadMessages { get; set; } 
        }


        // GET: api/Conversations
        // GET: Get all conversations of a user        
        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<ConversationDTO>>> GetUserConversations(int userId)
        {
            var conversations = await _context.Conversations
                .Where(c => c.ConvParticipants.Any(p => p.UserId == userId))
                .Include(c => c.ConvParticipants)
                .ThenInclude(cp => cp.User)
                .Include(c => c.Messages) 
                .ThenInclude(m => m.MessageReadStatuses) 
                .ToListAsync();

            var conversationDtos = conversations.Select(c => new ConversationDTO
            {
                ConvId = c.ConvId,
                CreatedAt = c.CreatedAt ?? DateTime.UtcNow,
                ParticipantIds = c.ConvParticipants.Select(p => p.UserId).ToList(),
                ParticipantUsernames = c.ConvParticipants
                    .Where(cp => cp.UserId != userId)
                    .Select(cp => cp.User.IsActive == true ? cp.User.Username : "Deactivated account")
                    .ToList(),
                ParticipantProfilePictures = c.ConvParticipants
                    .Where(cp => cp.UserId != userId)
                    .Select(cp => cp.User.IsActive == true ? cp.User.ProfilePic ?? "default-profile.jpg" : "default-profile.jpg")
                    .ToList(),
                HasUnreadMessages = c.Messages.Any(m =>
                   m.MessageReadStatuses.All(rs => rs.UserId != userId || !(rs.IsRead ?? false))) 
            }).ToList();

            return Ok(conversationDtos);
        }


        public class CreateConversationRequest
        {
            public List<int> Participants { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrGetConversation([FromBody] CreateConversationRequest request)
        {
            if (request.Participants == null || request.Participants.Count < 2)
            {
                return BadRequest("At least two participants are required.");
            }

            // Sort participant IDs for consistent comparison
            var participantIds = request.Participants.OrderBy(id => id).ToList();

            // Try to find an existing conversation with exactly these participants
            var existingConv = await _context.Conversations
                .Where(c => c.ConvParticipants.Count == participantIds.Count)
                .Where(c => c.ConvParticipants.All(cp => participantIds.Contains(cp.UserId)))
                .Include(c => c.ConvParticipants)
                .FirstOrDefaultAsync();

            if (existingConv != null)
            {
                return Ok(new { ConversationId = existingConv.ConvId });
            }

            // Otherwise, create a new conversation
            try
            {
                int newConvId;
                do
                {
                    newConvId = new Random().Next(1, int.MaxValue);
                } while (await _context.Conversations.AnyAsync(c => c.ConvId == newConvId));

                var conversation = new Conversation
                {
                    ConvId = newConvId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Conversations.Add(conversation);
                await _context.SaveChangesAsync();

                var participantsToAdd = new List<ConvParticipant>();

                foreach (var userId in participantIds)
                {
                    if (!await _context.Users.AnyAsync(u => u.UserId == userId))
                    {
                        return BadRequest($"User with ID {userId} does not exist.");
                    }

                    int newParticipantId;
                    do
                    {
                        newParticipantId = new Random().Next(1, int.MaxValue);
                    } while (await _context.ConvParticipants.AnyAsync(cp => cp.ParticipantId == newParticipantId));

                    participantsToAdd.Add(new ConvParticipant
                    {
                        ParticipantId = newParticipantId,
                        ConvId = newConvId,
                        UserId = userId,
                        JoinedAt = DateTime.UtcNow
                    });
                }

                await _context.ConvParticipants.AddRangeAsync(participantsToAdd);
                await _context.SaveChangesAsync();

                return Ok(new { ConversationId = newConvId });
            }
            catch (Exception ex)
            {
                System.Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }


    }
}
