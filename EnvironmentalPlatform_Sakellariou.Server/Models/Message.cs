using System;
using System.Collections.Generic;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Message
{
    public int MessageId { get; set; }

    public int ConvId { get; set; }

    public int SenderId { get; set; }

    public int ReceiverId { get; set; }

    public string? MessageContent { get; set; }

    public DateTime? SentAt { get; set; }

    public bool? IsRead { get; set; }

    public virtual Conversation Conv { get; set; } = null!;

    public virtual User Receiver { get; set; } = null!;

    public virtual User Sender { get; set; } = null!;
}
