using System.ComponentModel.DataAnnotations;
using WebApplication1.Domain.Entities;

namespace WebApplication1.Application.DTOs
{
    public class JobListDto
    {
        public int Id { get; set; }
        public string Title { get; set; }

        public DateTime CreatedAt { get; set; }
        
        
        public DateTime Deadline { get; set; }

        public JobStatus Status { get; set; }

        public JobStage? Stage { get; set; }
    }

    public class JobDetailDto : JobListDto
    {
        public DateTime? CompletedAt { get; set; }
            
        public List<JobHistoryDto> History { get; set; } = new();

        public string Description { get; set; }


    }
    public class JobHistoryDto
    {
        public int Id { get; set; }
        public JobStatus? OldStatus { get; set; }
        public JobStatus NewStatus { get; set; }
        public JobStage? OldStage { get; set; }
        public JobStage? NewStage { get; set; }
        public DateTime ChangedAt { get; set; }
        public string? Note { get; set; }
    }

    public class CreateJobDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [MaxLength(2000)]
        public string Description { get; set; } = null!;

        [Required]
        public DateTime Deadline { get; set; }
    }
    public class ChangeStatusDto
    {
        [Required]
        [EnumDataType(typeof(JobStatus))]
        public JobStatus NewStatus { get; set; }

        [EnumDataType(typeof(JobStage))]
        public JobStage? NewStage { get; set; }

        [MaxLength(1000)]
        public string? Note { get; set; }
    }

  

    public class LoginDto
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = null!;
        public string Username { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}
