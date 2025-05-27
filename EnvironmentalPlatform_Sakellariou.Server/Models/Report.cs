using System;
using System.Collections.Generic;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Report
{
    public int ReportId { get; set; }

    public int? PostId { get; set; }

    public int? CommentId { get; set; }

    public int? UserId { get; set; }

    public string? Reason { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Comment? Comment { get; set; }

    public virtual Post? Post { get; set; }

    public virtual User? User { get; set; }
}
