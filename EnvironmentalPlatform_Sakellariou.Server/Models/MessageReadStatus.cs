using System;
using System.Collections.Generic;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class MessageReadStatus
{
    public int Id { get; set; }

    public int? MessageId { get; set; }

    public int? UserId { get; set; }

    public bool? IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public virtual Message? Message { get; set; }

    public virtual User? User { get; set; }
}
