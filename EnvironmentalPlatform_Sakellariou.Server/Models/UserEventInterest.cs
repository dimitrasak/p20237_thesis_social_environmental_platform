using System;
using System.Collections.Generic;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class UserEventInterest
{
    public int InterestId { get; set; }

    public int UserId { get; set; }

    public int EventId { get; set; }

    public string? InterestType { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Event Event { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
