using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Controllers
{
    [Route("api/messages")]
    [ApiController]
    [EnableCors("AllowAllOrigins")]
    public class MessagesController : ControllerBase
    {
        private readonly SocialEnvironmentalPlatformContext _context;

        public MessagesController(SocialEnvironmentalPlatformContext context)
        {
            _context = context;
        }

        public class MessageDTO
        {
            public int MessageId { get; set; }
            public string MessageContent { get; set; }
            public int? SenderId { get; set; }
            public DateTime SentAt { get; set; }
        }


        // GET: Get messages for a conversation
        [HttpGet("{convId}")]
        public async Task<ActionResult<IEnumerable<MessageDTO>>> GetConversationMessages(int convId)
        {
            var messages = await _context.Messages
                .Where(m => m.ConvId == convId)
                .Select(m => new MessageDTO
                {
                    MessageId = m.MessageId,
                    MessageContent = m.MessageContent,
                    SenderId = m.SenderId,
                    SentAt = (DateTime)m.SentAt
                })
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return Ok(messages);
        }

        public class SendMessageDTO
        {
            public int ConvId { get; set; }
            public int SenderId { get; set; }
            public string MessageContent { get; set; } = string.Empty;
        }


        // POST: Send a new message
        [HttpPost]
        public async Task<ActionResult<Message>> SendMessage([FromBody] SendMessageDTO messageDto)
        {
            if (string.IsNullOrWhiteSpace(messageDto.MessageContent))
            {
                return BadRequest("Message content cannot be empty.");
            }

            // Check if the conversation exists
            var conversation = await _context.Conversations
                .Include(c => c.ConvParticipants) 
                .FirstOrDefaultAsync(c => c.ConvId == messageDto.ConvId);
            if (conversation == null)
            {
                return BadRequest("Conversation does not exist.");
            }

            int newMessageId;
            // Loop until a unique MessageId is found
            do
            {
                newMessageId = new Random().Next(1, int.MaxValue); // Generate random positive int
            } while (await _context.Messages.AnyAsync(m => m.MessageId == newMessageId)); // Ensure uniqueness           

            // Create the message
            var message = new Message
            {
                MessageId = newMessageId,
                ConvId = messageDto.ConvId,
                SenderId = messageDto.SenderId,
                MessageContent = messageDto.MessageContent,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            //Automatically create read status for each participant
            foreach (var participant in conversation.ConvParticipants)
            {
                int newReadStatusMessageId;
                // Loop until a unique MessageId is found
                do
                {
                    newReadStatusMessageId = new Random().Next(1, int.MaxValue); // Generate random positive int
                } while (await _context.MessageReadStatuses.AnyAsync(m => m.Id == newReadStatusMessageId)); // Ensure uniqueness           

                _context.MessageReadStatuses.Add(new MessageReadStatus
                {
                    Id = newReadStatusMessageId,
                    MessageId = message.MessageId,
                    UserId = participant.UserId,
                    IsRead = (participant.UserId == messageDto.SenderId), // Mark as read for the sender
                    ReadAt = (participant.UserId == messageDto.SenderId) ? DateTime.UtcNow : null
                });
            }

            await _context.SaveChangesAsync();

            //return CreatedAtAction(nameof(GetConversationMessages), new { convId = message.ConvId }, message);
            var responseMessage = new MessageDTO
            {
                MessageId = message.MessageId,
                MessageContent = message.MessageContent,
                SenderId = message.SenderId,
                SentAt = (DateTime)message.SentAt
            };

            return CreatedAtAction(nameof(GetConversationMessages), new { convId = message.ConvId }, responseMessage);

        }

        //PATCH: Mark a message as read
        [HttpPatch("mark-as-read/{messageId}/{userId}")]
        public async Task<IActionResult> MarkAsRead(int messageId, int userId)
        {
            var readStatus = await _context.MessageReadStatuses
                .FirstOrDefaultAsync(mrs => mrs.MessageId == messageId && mrs.UserId == userId);

            if (readStatus == null)
            {
                return NotFound("Read status not found.");
            }

            readStatus.IsRead = true;
            readStatus.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
