using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Notification
{
    [Key]
    [Column("notification_id")]
    public int NotificationId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("type")]
    [StringLength(500)]
    [Unicode(false)]
    public string? Type { get; set; }

    [Column("refernce_id")]
    public int? RefernceId { get; set; }

    [Column("message")]
    [StringLength(1000)]
    [Unicode(false)]
    public string? Message { get; set; }

    [Column("isRead")]
    public bool? IsRead { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Notifications")]
    public virtual User User { get; set; } = null!;
}
