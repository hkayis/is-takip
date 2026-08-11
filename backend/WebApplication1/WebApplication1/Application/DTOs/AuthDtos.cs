namespace WebApplication1.Application.DTOs
{
    
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
