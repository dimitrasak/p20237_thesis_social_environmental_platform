using System;
using System.Collections.Generic;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Post
{
    public int PostId { get; set; }

    public int? EventId { get; set; }

    public int? UserId { get; set; }

    public string? PostContent { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual Event? Event { get; set; }

    public virtual User? User { get; set; }
}
