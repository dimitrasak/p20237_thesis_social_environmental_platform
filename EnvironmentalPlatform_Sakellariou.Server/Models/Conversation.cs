using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Conversation
{
    [Key]
    [Column("conv_id")]
    public int ConvId { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [InverseProperty("Conv")]
    public virtual ICollection<ConvParticipant> ConvParticipants { get; set; } = new List<ConvParticipant>();

    [InverseProperty("Conv")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}
