using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

[Keyless]
public partial class EventCategory
{
    [Column("event_id")]
    public int? EventId { get; set; }

    [Column("cat_id")]
    public int? CatId { get; set; }

    [ForeignKey("CatId")]
    public virtual Category? Cat { get; set; }

    [ForeignKey("EventId")]
    public virtual Event? Event { get; set; }
}
