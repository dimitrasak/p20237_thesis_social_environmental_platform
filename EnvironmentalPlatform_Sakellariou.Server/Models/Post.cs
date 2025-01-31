using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Post
{
    [Key]
    [Column("post_id")]
    public int PostId { get; set; }

    [Column("event_id")]
    public int? EventId { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("post_content")]
    [StringLength(1000)]
    [Unicode(false)]
    public string? PostContent { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [InverseProperty("Post")]
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    [ForeignKey("EventId")]
    [InverseProperty("Posts")]
    public virtual Event? Event { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Posts")]
    public virtual User? User { get; set; }
}
