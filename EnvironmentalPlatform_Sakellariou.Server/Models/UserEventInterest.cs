using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

[Table("UserEventInterest")]
public partial class UserEventInterest
{
    [Key]
    [Column("interest_id")]
    public int InterestId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("event_id")]
    public int EventId { get; set; }

    [Column("interest_type")]
    [StringLength(100)]
    [Unicode(false)]
    public string? InterestType { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("EventId")]
    [InverseProperty("UserEventInterests")]
    public virtual Event Event { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("UserEventInterests")]
    public virtual User User { get; set; } = null!;
}
