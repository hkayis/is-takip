using Microsoft.EntityFrameworkCore;
using WebApplication1.Application.DTOs;
using WebApplication1.Data;

namespace WebApplication1.Application.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;

        public AuthService(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == dto.Username);

            // kullanıcı yok VEYA şifre yanlış — ikisini de aynı şekilde ele al
            if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return null;

            var (token, expiresAt) = _tokenService.CreateToken(user);

            return new LoginResponseDto
            {
                Token = token,
                Username = user.Username,
                ExpiresAt = expiresAt
            };
        }
    }
}