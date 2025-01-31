using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Event
{
    [Key]
    [Column("event_id")]
    public int EventId { get; set; }

    [Column("org_id")]
    public int? OrgId { get; set; }

    [Column("title")]
    [StringLength(50)]
    [Unicode(false)]
    public string? Title { get; set; }

    [Column("description")]
    [StringLength(50)]
    [Unicode(false)]
    public string? Description { get; set; }

    [Column("location")]
    [StringLength(100)]
    [Unicode(false)]
    public string? Location { get; set; }

    [Column("date", TypeName = "datetime")]
    public DateTime? Date { get; set; }

    [Column("requirements")]
    [StringLength(1000)]
    [Unicode(false)]
    public string? Requirements { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [Column("isActive")]
    public bool? IsActive { get; set; }

    [ForeignKey("OrgId")]
    [InverseProperty("Events")]
    public virtual Organisation? Org { get; set; }

    [InverseProperty("Event")]
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();

    [InverseProperty("Event")]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    [InverseProperty("Event")]
    public virtual ICollection<UserEventInterest> UserEventInterests { get; set; } = new List<UserEventInterest>();
}
