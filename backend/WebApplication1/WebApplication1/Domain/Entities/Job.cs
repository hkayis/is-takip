namespace WebApplication1.Domain.Entities
{
    public enum JobStatus
    {
        Beklemede = 0,
        DevamEdiyor = 1,
        Tamamlandi = 2,
        Iptal = 3
    }

    public enum JobStage
    {
        Plan = 0,
        Design = 1,
        Develop = 2,
        Test = 3,
        Deploy = 4,
        Review = 5
    }

    public class Job
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public JobStatus Status { get; set; } = JobStatus.Beklemede;
        public JobStage? Stage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? CompletedAt { get; set; }
        public DateTime Deadline { get; set; }

        public List<JobHistory> History { get; set; } = new List<JobHistory>();
    }
}
