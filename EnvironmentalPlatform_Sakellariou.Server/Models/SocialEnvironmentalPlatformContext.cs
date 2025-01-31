using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace EnvironmentalPlatform_Sakellariou.Server.Models;

public partial class SocialEnvironmentalPlatformContext : DbContext
{
    public SocialEnvironmentalPlatformContext()
    {
    }

    public SocialEnvironmentalPlatformContext(DbContextOptions<SocialEnvironmentalPlatformContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<ConvParticipant> ConvParticipants { get; set; }

    public virtual DbSet<Conversation> Conversations { get; set; }

    public virtual DbSet<Event> Events { get; set; }

    public virtual DbSet<EventCategory> EventCategories { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Organisation> Organisations { get; set; }

    public virtual DbSet<Post> Posts { get; set; }

    public virtual DbSet<RegularUser> RegularUsers { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserEventInterest> UserEventInterests { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=DESKTOP-FNPGPDV\\SQLEXPRESS;Database=social_climate_platform;Trusted_Connection=True;Trust Server Certificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(e => e.CategoryId).ValueGeneratedNever();
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.Property(e => e.CommentId).ValueGeneratedNever();

            entity.HasOne(d => d.Post).WithMany(p => p.Comments).HasConstraintName("FK_Comments_Posts");

            entity.HasOne(d => d.User).WithMany(p => p.Comments).HasConstraintName("FK_Comments_Users");
        });

        modelBuilder.Entity<ConvParticipant>(entity =>
        {
            entity.Property(e => e.ParticipantId).ValueGeneratedNever();

            entity.HasOne(d => d.Conv).WithMany(p => p.ConvParticipants)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ConvParticipants_Conversations");

            entity.HasOne(d => d.User).WithMany(p => p.ConvParticipants)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ConvParticipants_Users");
        });

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.Property(e => e.ConvId).ValueGeneratedNever();
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.Property(e => e.EventId).ValueGeneratedNever();

            entity.HasOne(d => d.Org).WithMany(p => p.Events).HasConstraintName("FK_Events_Organisations");
        });

        modelBuilder.Entity<EventCategory>(entity =>
        {
            entity.HasOne(d => d.Cat).WithMany().HasConstraintName("FK_EventCategories_Categories");

            entity.HasOne(d => d.Event).WithMany().HasConstraintName("FK_EventCategories_Events");
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.Property(e => e.MessageId).ValueGeneratedNever();

            entity.HasOne(d => d.Conv).WithMany(p => p.Messages)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Messages_Conversations");

            entity.HasOne(d => d.Receiver).WithMany(p => p.MessageReceivers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Messages_Users1");

            entity.HasOne(d => d.Sender).WithMany(p => p.MessageSenders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Messages_Users");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.Property(e => e.NotificationId).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notifications_Users");
        });

        modelBuilder.Entity<Organisation>(entity =>
        {
            entity.Property(e => e.OrganisationId).ValueGeneratedNever();

            entity.HasOne(d => d.OrganisationNavigation).WithOne(p => p.Organisation)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Organisations_Users");
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.Property(e => e.PostId).ValueGeneratedNever();

            entity.HasOne(d => d.Event).WithMany(p => p.Posts).HasConstraintName("FK_Posts_Events");

            entity.HasOne(d => d.User).WithMany(p => p.Posts).HasConstraintName("FK_Posts_Users");
        });

        modelBuilder.Entity<RegularUser>(entity =>
        {
            entity.HasOne(d => d.Reg).WithMany()
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Regular_users_Users");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.Property(e => e.ReviewId).ValueGeneratedNever();

            entity.HasOne(d => d.Event).WithMany(p => p.Reviews).HasConstraintName("FK_Reviews_Events");

            entity.HasOne(d => d.Org).WithMany(p => p.Reviews).HasConstraintName("FK_Reviews_Organisations");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews).HasConstraintName("FK_Reviews_Users");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.UserId).ValueGeneratedNever();
        });

        modelBuilder.Entity<UserEventInterest>(entity =>
        {
            entity.Property(e => e.InterestId).ValueGeneratedNever();

            entity.HasOne(d => d.Event).WithMany(p => p.UserEventInterests)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserEventInterest_Events");

            entity.HasOne(d => d.User).WithMany(p => p.UserEventInterests)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserEventInterest_Users");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
