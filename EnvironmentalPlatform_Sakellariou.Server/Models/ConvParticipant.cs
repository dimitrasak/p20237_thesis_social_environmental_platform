using System;
using System.Collections.Generic;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class ConvParticipant
{
    public int ParticipantId { get; set; }

    public int ConvId { get; set; }

    public int UserId { get; set; }

    public DateTime? JoinedAt { get; set; }

    public virtual Conversation Conv { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
