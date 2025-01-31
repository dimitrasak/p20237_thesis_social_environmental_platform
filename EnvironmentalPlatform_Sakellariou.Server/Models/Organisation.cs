using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class Organisation
{
    [Key]
    [Column("organisation_id")]
    public int OrganisationId { get; set; }

    [Column("name")]
    [StringLength(150)]
    [Unicode(false)]
    public string? Name { get; set; }

    [Column("afm")]
    public int? Afm { get; set; }

    [Column("website")]
    [StringLength(150)]
    [Unicode(false)]
    public string? Website { get; set; }

    [Column("headquarters")]
    [StringLength(150)]
    [Unicode(false)]
    public string? Headquarters { get; set; }

    [Column("aim")]
    [StringLength(150)]
    [Unicode(false)]
    public string? Aim { get; set; }

    [Column("legal_form")]
    [StringLength(100)]
    [Unicode(false)]
    public string? LegalForm { get; set; }

    [InverseProperty("Org")]
    public virtual ICollection<Event> Events { get; set; } = new List<Event>();

    [ForeignKey("OrganisationId")]
    [InverseProperty("Organisation")]
    public virtual User OrganisationNavigation { get; set; } = null!;

    [InverseProperty("Org")]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
