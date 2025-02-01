using System;
using System.Collections.Generic;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Organisation
{
    public int OrganisationId { get; set; }

    public string? Name { get; set; }

    public int? Afm { get; set; }

    public string? Website { get; set; }

    public string? Headquarters { get; set; }

    public string? Aim { get; set; }

    public string? LegalForm { get; set; }

    public virtual ICollection<Event> Events { get; set; } = new List<Event>();

    public virtual User OrganisationNavigation { get; set; } = null!;

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
