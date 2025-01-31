using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Review
{
    [Key]
    [Column("review_id")]
    public int ReviewId { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("event_id")]
    public int? EventId { get; set; }

    [Column("org_id")]
    public int? OrgId { get; set; }

    [Column("rating")]
    [StringLength(50)]
    [Unicode(false)]
    public string? Rating { get; set; }

    [Column("comment")]
    [StringLength(150)]
    [Unicode(false)]
    public string? Comment { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("EventId")]
    [InverseProperty("Reviews")]
    public virtual Event? Event { get; set; }

    [ForeignKey("OrgId")]
    [InverseProperty("Reviews")]
    public virtual Organisation? Org { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Reviews")]
    public virtual User? User { get; set; }
}
