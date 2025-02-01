using System;
using System.Collections.Generic;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class RegularUser
{
    public string? Name { get; set; }

    public string? Surname { get; set; }

    public string? Profession { get; set; }

    public string? DateOfBirth { get; set; }

    public int RegId { get; set; }

    public virtual User Reg { get; set; } = null!;
}
