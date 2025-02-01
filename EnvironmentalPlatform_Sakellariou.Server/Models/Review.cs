using System;
using System.Collections.Generic;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Review
{
    public int ReviewId { get; set; }

    public int? UserId { get; set; }

    public int? EventId { get; set; }

    public int? OrgId { get; set; }

    public string? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Event? Event { get; set; }

    public virtual Organisation? Org { get; set; }

    public virtual User? User { get; set; }
}
