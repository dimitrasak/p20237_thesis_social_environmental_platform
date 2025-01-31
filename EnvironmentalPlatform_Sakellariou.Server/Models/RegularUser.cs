using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

[Keyless]
[Table("Regular_users")]
public partial class RegularUser
{
    [Column("name")]
    [StringLength(100)]
    [Unicode(false)]
    public string? Name { get; set; }

    [Column("surname")]
    [StringLength(100)]
    [Unicode(false)]
    public string? Surname { get; set; }

    [Column("profession")]
    [StringLength(100)]
    [Unicode(false)]
    public string? Profession { get; set; }

    [Column("date_of_birth")]
    [StringLength(100)]
    [Unicode(false)]
    public string? DateOfBirth { get; set; }

    [Column("reg_id")]
    public int RegId { get; set; }

    [ForeignKey("RegId")]
    public virtual User Reg { get; set; } = null!;
}
