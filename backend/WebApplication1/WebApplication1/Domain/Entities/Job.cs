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
        Analiz = 0,
        Gelistirme = 1,
        Test = 2,
        Tasima = 3,
    }

    public enum JobPriority
    {

        Dusuk= 0,
        Normal=1,
        Yuksek=2,
        Acil=3
    }
    public enum JobSize
    {
        FastTrack = 0,
        XS = 1,
        S = 2,
        M= 3,
        L= 4,
        XL= 5,
    }
    public class Job
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public JobStatus Status { get; set; } = JobStatus.Beklemede;
        public JobStage? Stage { get; set; }

        public JobPriority Priority { get; set; }= JobPriority.Normal;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? CompletedAt { get; set; }
        public DateTime Deadline { get; set; }

        // Efor tahmini: kaç kişi × kaç gün = adam-gün
        public int? Adam { get; set; }
        public int? Gun { get; set; }

        public JobSize Buyukluk { get; set; }
        public string? Not { get; set; }
        public List<JobHistory> History { get; set; } = new List<JobHistory>();
    }
}
