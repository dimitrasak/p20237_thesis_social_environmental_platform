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

    public virtual DbSet<MessageReadStatus> MessageReadStatuses { get; set; }

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
            entity.Property(e => e.CategoryId)
                .ValueGeneratedNever()
                .HasColumnName("category_id");
            entity.Property(e => e.Description)
                .HasMaxLength(5000)
                .IsUnicode(false)
                .HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(5000)
                .IsUnicode(false)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.Property(e => e.CommentId)
                .ValueGeneratedNever()
                .HasColumnName("comment_id");
            entity.Property(e => e.CommentContent)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("comment_content");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.PostId).HasColumnName("post_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Post).WithMany(p => p.Comments)
                .HasForeignKey(d => d.PostId)
                .HasConstraintName("FK_Comments_Posts");

            entity.HasOne(d => d.User).WithMany(p => p.Comments)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Comments_Users");
        });

        modelBuilder.Entity<ConvParticipant>(entity =>
        {
            entity.HasKey(e => e.ParticipantId);

            entity.Property(e => e.ParticipantId)
                .ValueGeneratedNever()
                .HasColumnName("participant_id");
            entity.Property(e => e.ConvId).HasColumnName("conv_id");
            entity.Property(e => e.JoinedAt)
                .HasColumnType("datetime")
                .HasColumnName("joined_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Conv).WithMany(p => p.ConvParticipants)
                .HasForeignKey(d => d.ConvId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ConvParticipants_Conversations");

            entity.HasOne(d => d.User).WithMany(p => p.ConvParticipants)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ConvParticipants_Users");
        });

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(e => e.ConvId);

            entity.Property(e => e.ConvId)
                .ValueGeneratedNever()
                .HasColumnName("conv_id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.Property(e => e.EventId)
                .ValueGeneratedNever()
                .HasColumnName("event_id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Date)
                .HasColumnType("datetime")
                .HasColumnName("date");
            entity.Property(e => e.Description)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("description");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(1500)
                .IsUnicode(false)
                .HasColumnName("imageUrl");
            entity.Property(e => e.IsActive).HasColumnName("isActive");
            entity.Property(e => e.Location)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("location");
            entity.Property(e => e.OrgId).HasColumnName("org_id");
            entity.Property(e => e.Requirements)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("requirements");
            entity.Property(e => e.Title)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("title");

            entity.HasOne(d => d.Org).WithMany(p => p.Events)
                .HasForeignKey(d => d.OrgId)
                .HasConstraintName("FK_Events_Organisations");
        });

        modelBuilder.Entity<EventCategory>(entity =>
        {
            entity.HasKey(e => e.EventCatId).HasName("PK__EventCat__A278382C317C4092");

            entity.Property(e => e.EventCatId)
                .ValueGeneratedNever()
                .HasColumnName("event_cat_id");
            entity.Property(e => e.CatId).HasColumnName("cat_id");
            entity.Property(e => e.EventId).HasColumnName("event_id");

            entity.HasOne(d => d.Cat).WithMany(p => p.EventCategories)
                .HasForeignKey(d => d.CatId)
                .HasConstraintName("FK_EventCategories_Categories");

            entity.HasOne(d => d.Event).WithMany(p => p.EventCategories)
                .HasForeignKey(d => d.EventId)
                .HasConstraintName("FK_EventCategories_Events");
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.Property(e => e.MessageId)
                .ValueGeneratedNever()
                .HasColumnName("message_id");
            entity.Property(e => e.ConvId).HasColumnName("conv_id");
            entity.Property(e => e.MessageContent)
                .HasMaxLength(1500)
                .IsUnicode(false)
                .HasColumnName("message_content");
            entity.Property(e => e.SenderId).HasColumnName("sender_id");
            entity.Property(e => e.SentAt)
                .HasColumnType("datetime")
                .HasColumnName("sent_at");

            entity.HasOne(d => d.Conv).WithMany(p => p.Messages)
                .HasForeignKey(d => d.ConvId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Messages_Conversations");

            entity.HasOne(d => d.Sender).WithMany(p => p.Messages)
                .HasForeignKey(d => d.SenderId)
                .HasConstraintName("FK_Messages_Users");
        });

        modelBuilder.Entity<MessageReadStatus>(entity =>
        {
            entity.ToTable("MessageReadStatus");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.IsRead).HasColumnName("isRead");
            entity.Property(e => e.MessageId).HasColumnName("messageId");
            entity.Property(e => e.ReadAt)
                .HasColumnType("datetime")
                .HasColumnName("readAt");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.Message).WithMany(p => p.MessageReadStatuses)
                .HasForeignKey(d => d.MessageId)
                .HasConstraintName("FK_MessageReadStatus_Messages");

            entity.HasOne(d => d.User).WithMany(p => p.MessageReadStatuses)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_MessageReadStatus_Users");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.Property(e => e.NotificationId)
                .ValueGeneratedNever()
                .HasColumnName("notification_id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.IsRead).HasColumnName("isRead");
            entity.Property(e => e.Message)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("message");
            entity.Property(e => e.RefernceId).HasColumnName("refernce_id");
            entity.Property(e => e.Type)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("type");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notifications_Users");
        });

        modelBuilder.Entity<Organisation>(entity =>
        {
            entity.Property(e => e.OrganisationId)
                .ValueGeneratedNever()
                .HasColumnName("organisation_id");
            entity.Property(e => e.Afm).HasColumnName("afm");
            entity.Property(e => e.Aim)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("aim");
            entity.Property(e => e.Headquarters)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("headquarters");
            entity.Property(e => e.LegalForm)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("legal_form");
            entity.Property(e => e.Name)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("name");
            entity.Property(e => e.Website)
                .HasMaxLength(150)
                .IsUnicode(false)
                .HasColumnName("website");

            entity.HasOne(d => d.OrganisationNavigation).WithOne(p => p.Organisation)
                .HasForeignKey<Organisation>(d => d.OrganisationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Organisations_Users");
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.Property(e => e.PostId)
                .ValueGeneratedNever()
                .HasColumnName("post_id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.EventId).HasColumnName("event_id");
            entity.Property(e => e.PostContent)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("post_content");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Event).WithMany(p => p.Posts)
                .HasForeignKey(d => d.EventId)
                .HasConstraintName("FK_Posts_Events");

            entity.HasOne(d => d.User).WithMany(p => p.Posts)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Posts_Users");
        });

        modelBuilder.Entity<RegularUser>(entity =>
        {
            entity.HasKey(e => e.RegId);

            entity.ToTable("Regular_users");

            entity.Property(e => e.RegId)
                .ValueGeneratedNever()
                .HasColumnName("reg_id");
            entity.Property(e => e.DateOfBirth)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("date_of_birth");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("name");
            entity.Property(e => e.Profession)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("profession");
            entity.Property(e => e.Surname)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("surname");

            entity.HasOne(d => d.Reg).WithOne(p => p.RegularUser)
                .HasForeignKey<RegularUser>(d => d.RegId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Regular_users_Users");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.Property(e => e.ReviewId)
                .ValueGeneratedNever()
                .HasColumnName("review_id");
            entity.Property(e => e.Comment)
                .HasMaxLength(5000)
                .IsUnicode(false)
                .HasColumnName("comment");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.EventId).HasColumnName("event_id");
            entity.Property(e => e.OrgId).HasColumnName("org_id");
            entity.Property(e => e.Rating)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("rating");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Event).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.EventId)
                .HasConstraintName("FK_Reviews_Events");

            entity.HasOne(d => d.Org).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.OrgId)
                .HasConstraintName("FK_Reviews_Organisations");

            entity.HasOne(d => d.User).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_Reviews_Users");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.UserId)
                .ValueGeneratedNever()
                .HasColumnName("user_id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.IsActive).HasColumnName("isActive");
            entity.Property(e => e.Password)
                .HasMaxLength(1000)
                .IsUnicode(false)
                .HasColumnName("password");
            entity.Property(e => e.ProfilePic)
                .HasMaxLength(1500)
                .IsUnicode(false)
                .HasColumnName("profilePic");
            entity.Property(e => e.Role)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("role");
            entity.Property(e => e.Salt)
                .HasMaxLength(1000)
                .IsUnicode(false);
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("username");
        });

        modelBuilder.Entity<UserEventInterest>(entity =>
        {
            entity.HasKey(e => e.InterestId);

            entity.ToTable("UserEventInterest");

            entity.Property(e => e.InterestId)
                .ValueGeneratedNever()
                .HasColumnName("interest_id");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.EventId).HasColumnName("event_id");
            entity.Property(e => e.InterestType)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("interest_type");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Event).WithMany(p => p.UserEventInterests)
                .HasForeignKey(d => d.EventId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserEventInterest_Events");

            entity.HasOne(d => d.User).WithMany(p => p.UserEventInterests)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserEventInterest_Users");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
