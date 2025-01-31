using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class ConvParticipant
{
    [Key]
    [Column("participant_id")]
    public int ParticipantId { get; set; }

    [Column("conv_id")]
    public int ConvId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("joined_at", TypeName = "datetime")]
    public DateTime? JoinedAt { get; set; }

    [ForeignKey("ConvId")]
    [InverseProperty("ConvParticipants")]
    public virtual Conversation Conv { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("ConvParticipants")]
    public virtual User User { get; set; } = null!;
}
