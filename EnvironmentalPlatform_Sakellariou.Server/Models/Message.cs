using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Message
{
    [Key]
    [Column("message_id")]
    public int MessageId { get; set; }

    [Column("conv_id")]
    public int ConvId { get; set; }

    [Column("sender_id")]
    public int SenderId { get; set; }

    [Column("receiver_id")]
    public int ReceiverId { get; set; }

    [Column("message_content")]
    [StringLength(1500)]
    [Unicode(false)]
    public string? MessageContent { get; set; }

    [Column("sent_at", TypeName = "datetime")]
    public DateTime? SentAt { get; set; }

    [Column("isRead")]
    public bool? IsRead { get; set; }

    [ForeignKey("ConvId")]
    [InverseProperty("Messages")]
    public virtual Conversation Conv { get; set; } = null!;

    [ForeignKey("ReceiverId")]
    [InverseProperty("MessageReceivers")]
    public virtual User Receiver { get; set; } = null!;

    [ForeignKey("SenderId")]
    [InverseProperty("MessageSenders")]
    public virtual User Sender { get; set; } = null!;
}
