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
                    .Select(cp => cp.User.Username)    
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

        // POST: Create a new conversation or return existing one
        [HttpPost]
        public async Task<IActionResult> CreateConversation([FromBody] CreateConversationRequest request)
        {
            if (request.Participants == null || request.Participants.Count < 2)
            {
                return BadRequest("At least two participants are required.");
            }

            try
            {
                // Generate a new unique conversation ID
                int newConvId;
                do
                {
                    newConvId = new Random().Next(1, int.MaxValue); // Generate random positive int
                } while (await _context.Conversations.AnyAsync(c => c.ConvId == newConvId)); // Ensure uniqueness

                var conversation = new Conversation
                {
                    ConvId = newConvId,
                    CreatedAt = DateTime.UtcNow
                };

                // Create the new conversation and save
                _context.Conversations.Add(conversation);
                await _context.SaveChangesAsync(); // Save conversation first to get the ConvId

                // Prepare a list to hold ConvParticipant entities
                var participantsToAdd = new List<ConvParticipant>();

                // Process each participant from the request payload
                foreach (var userId in request.Participants)
                {
                    // Check if the user exists
                    var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
                    if (!userExists)
                    {
                        return BadRequest($"User with ID {userId} does not exist.");
                    }

                    // Generate a unique participant ID
                    int newParticipantId;
                    do
                    {
                        newParticipantId = new Random().Next(1, int.MaxValue); // Generate random positive int
                    } while (await _context.ConvParticipants.AnyAsync(cp => cp.ParticipantId == newParticipantId)); // Ensure uniqueness

                    // Prepare the participant entry for ConvParticipants table
                    var participant = new ConvParticipant
                    {
                        ParticipantId = newParticipantId, 
                        ConvId = newConvId,               
                        UserId = userId,                  
                        JoinedAt = DateTime.UtcNow        
                    };

                    // Add the participant to the list
                    participantsToAdd.Add(participant);
                }

                // Check if any participants were created
                if (participantsToAdd.Any())
                {
                    // Insert all participants at once
                    await _context.ConvParticipants.AddRangeAsync(participantsToAdd);
                    await _context.SaveChangesAsync(); // Save all participants

                    return Ok(new { ConversationId = newConvId });
                }

                // Return a bad request if no participants were added
                return BadRequest("No participants to add to the conversation.");
            }
            catch (Exception ex)
            {
                // Log the error details for debugging
                System.Console.WriteLine($"Error occurred while creating the conversation: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

    }
}
