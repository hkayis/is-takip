using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WebApplication1.Domain.Entities;

namespace WebApplication1.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Job> Jobs { get; set; }
        public DbSet<JobHistory> JobHistories { get; set; }

        public DbSet<User> Users { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var utcConverter = new ValueConverter<DateTime, DateTime>(
                v => v,
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            var utcNullableConverter = new ValueConverter<DateTime?, DateTime?>(
                v => v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

            modelBuilder.Entity<Job>(entity =>
            {
                entity.Property(j => j.Id).ValueGeneratedNever();

                entity.Property(j => j.Title)
                      .IsRequired()
                      .HasMaxLength(200);

                entity.Property(j => j.Status)
                      .HasConversion<string>()
                      .HasMaxLength(30);

                entity.Property(j => j.Stage)
                      .HasConversion<string>()
                      .HasMaxLength(30);
                entity.Property(j=> j.Priority)
                    .HasConversion<string>()
                    .HasMaxLength (30);



                entity.Property(j => j.CreatedAt).HasConversion(utcConverter);
                entity.Property(j => j.Deadline).HasConversion(utcConverter);
                entity.Property(j => j.CompletedAt).HasConversion(utcNullableConverter);
            });

            modelBuilder.Entity<JobHistory>(entity =>
            {
                entity.Property(h => h.OldStatus).HasConversion<string>().HasMaxLength(30);
                entity.Property(h => h.NewStatus).HasConversion<string>().HasMaxLength(30);
                entity.Property(h => h.OldStage).HasConversion<string>().HasMaxLength(30);
                entity.Property(h => h.NewStage).HasConversion<string>().HasMaxLength(30);

                entity.Property(h => h.ChangedAt).HasConversion(utcConverter);

                entity.HasOne(h => h.Job)
                      .WithMany(j => j.History)
                      .HasForeignKey(h => h.JobId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(h => new { h.JobId, h.ChangedAt });
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(u => u.Username)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(u => u.PasswordHash)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.HasIndex(u => u.Username).IsUnique();
            });
        }
    }
}