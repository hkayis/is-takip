namespace WebApplication1.Domain.Entities
{
    public class JobHistory
    {
        public int Id { get; set; }

        public int JobId { get; set; }
        public Job Job { get; set; }             

        public JobStatus? OldStatus { get; set; }  
        public JobStatus NewStatus { get; set; }  

        public JobStage? OldStage { get; set; }    
        public JobStage? NewStage { get; set; }    

        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
        public string? Note { get; set; }         
        public string? Changes { get; set; }

    }
}
