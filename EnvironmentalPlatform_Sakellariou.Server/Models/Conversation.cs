using System;
using System.Collections.Generic;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Conversation
{
    public int ConvId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<ConvParticipant> ConvParticipants { get; set; } = new List<ConvParticipant>();

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}
