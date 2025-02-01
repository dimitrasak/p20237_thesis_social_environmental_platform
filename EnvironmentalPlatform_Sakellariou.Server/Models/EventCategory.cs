using System;
using System.Collections.Generic;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class EventCategory
{
    public int? EventId { get; set; }

    public int? CatId { get; set; }

    public virtual Category? Cat { get; set; }

    public virtual Event? Event { get; set; }
}
