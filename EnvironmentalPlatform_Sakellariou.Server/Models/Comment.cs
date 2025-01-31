using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Comment
{
    [Key]
    [Column("comment_id")]
    public int CommentId { get; set; }

    [Column("post_id")]
    public int? PostId { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("comment_content")]
    [StringLength(1000)]
    [Unicode(false)]
    public string? CommentContent { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("PostId")]
    [InverseProperty("Comments")]
    public virtual Post? Post { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Comments")]
    public virtual User? User { get; set; }
}
