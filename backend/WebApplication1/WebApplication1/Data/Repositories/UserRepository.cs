
using Microsoft.EntityFrameworkCore;
using WebApplication1.Application.Interfaces;
using WebApplication1.Domain.Entities;

namespace WebApplication1.Data.Repositories
{
    public class UserRepository :IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context) => _context = context;

        public Task<User?> KullaniciAdiylaGetirAsync(string kullaniciAdi) =>
            _context.Users.FirstOrDefaultAsync(u => u.Username == kullaniciAdi);
    }
}
