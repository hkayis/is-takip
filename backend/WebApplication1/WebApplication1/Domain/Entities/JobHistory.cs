namespace WebApplication1.Domain.Entities
{
    public class JobHistory
    {
        public int Id { get; set; }

        public int JobId { get; set; }
        public Job Job { get; set; }              // hangi işe ait

        public JobStatus? OldStatus { get; set; }  // önceki durum (ilk kayıtta null)
        public JobStatus NewStatus { get; set; }   // yeni durum

        public JobStage? OldStage { get; set; }    // önceki aşama (varsa)
        public JobStage? NewStage { get; set; }    // yeni aşama (varsa)

        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;


        public string? Note { get; set; }          // opsiyonel açıklama
    }
}
