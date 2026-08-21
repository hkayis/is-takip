using Microsoft.EntityFrameworkCore;
using WebApplication1.Application.DTOs;
using WebApplication1.Application.Interfaces;

namespace WebApplication1.Application.Services
{
    public class AuthService
    {
        private readonly IUserRepository _repo;
        private readonly TokenService _tokenService;

        public AuthService(IUserRepository repo, TokenService tokenService)
        {
            _repo = repo;
            _tokenService = tokenService;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
        {
            var user = await _repo.KullaniciAdiylaGetirAsync(dto.Username);

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