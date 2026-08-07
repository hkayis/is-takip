using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;
using System.Text.Json.Serialization;
using WebApplication1.Application.Services;
using WebApplication1.Data;
using WebApplication1.Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<JobService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TokenService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// JWT doğrulama
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Angular için CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularApp", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddOpenApi();

var app = builder.Build();

// ilk admin kullanıcısını oluştur
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    if (!await db.Users.AnyAsync())
    {
        db.Users.Add(new User
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            
        });
        await db.SaveChangesAsync();
    }
    // örnek iş verisi (sadece tablo boşsa)
    if (!await db.Jobs.AnyAsync())
    {
        var bugun = DateTime.UtcNow.Date;

        Job Olustur(int id, string baslik, string aciklama, int teslimGun,
                    JobStatus durum, JobPriority oncelik, JobStage? asama,
                    int? adam, int? gun, int kacGunOnceAcildi)
        {
            var acilis = bugun.AddDays(-kacGunOnceAcildi);

            var job = new Job
            {
                Id = id,
                Title = baslik,
                Description = aciklama,
                Deadline = bugun.AddDays(teslimGun),
                Status = durum,
                Stage = asama,
                Priority = oncelik,
                Adam = adam,
                Gun = gun,
                CreatedAt = acilis,
                CompletedAt = durum == JobStatus.Tamamlandi ? bugun.AddDays(-2) : null,
            };

            job.History.Add(new JobHistory
            {
                OldStatus = null,
                NewStatus = JobStatus.Beklemede,
                ChangedAt = acilis,
                Note = "İş oluşturuldu",
            });

            if (durum != JobStatus.Beklemede)
            {
                job.History.Add(new JobHistory
                {
                    OldStatus = JobStatus.Beklemede,
                    NewStatus = durum,
                    OldStage = null,
                    NewStage = asama,
                    ChangedAt = acilis.AddDays(1),
                    Note = durum switch
                    {
                        JobStatus.DevamEdiyor => "Çalışmaya başlandı",
                        JobStatus.Tamamlandi => "Tamamlanıp teslim edildi",
                        JobStatus.Iptal => "Talep geri çekildi",
                        _ => null,
                    },
                });
            }

            return job;
        }

        db.Jobs.AddRange(
            // --- geciken işler ---
            Olustur(1001, "Q3 finansal rapor", "Üçüncü çeyrek gelir-gider raporunun hazırlanması ve yönetime sunulması.",
                    -5, JobStatus.DevamEdiyor, JobPriority.Acil, JobStage.Tasima, 2, 3, 20),
            Olustur(1002, "Tedarikçi sözleşme yenileme", "Lojistik tedarikçisiyle yıllık sözleşmenin gözden geçirilmesi.",
                    -12, JobStatus.Beklemede, JobPriority.Yuksek, null, 1, 5, 30),
            Olustur(1003, "Sunucu güvenlik yaması", "Kritik güvenlik güncellemelerinin üretim ortamına uygulanması.",
                    -2, JobStatus.DevamEdiyor, JobPriority.Acil, JobStage.Test, 1, 2, 10),

            // --- bugün / yaklaşan ---
            Olustur(1004, "Ekip performans değerlendirmesi", "Çeyrek dönem performans görüşmelerinin planlanması.",
                    0, JobStatus.DevamEdiyor, JobPriority.Normal, JobStage.Analiz, 1, 4, 14),
            Olustur(1005, "Müşteri demo hazırlığı", "Yeni modülün müşteriye sunulacak demo ortamının hazırlanması.",
                    2, JobStatus.DevamEdiyor, JobPriority.Yuksek, JobStage.Gelistirme, 2, 4, 8),
            Olustur(1006, "Bütçe revizyonu", "Yılsonu bütçesinin güncel harcamalara göre revize edilmesi.",
                    5, JobStatus.Beklemede, JobPriority.Normal, null, 1, 3, 6),

            // --- ileri tarihli ---
            Olustur(1007, "Yeni CRM entegrasyonu", "Satış ekibinin kullandığı CRM ile sistemin entegre edilmesi.",
                    30, JobStatus.DevamEdiyor, JobPriority.Yuksek, JobStage.Analiz, 2, 15, 12),
            Olustur(1008, "Ofis taşınma planı", "Yeni ofise taşınma sürecinin planlanması ve koordinasyonu.",
                    40, JobStatus.Beklemede, JobPriority.Normal, null, 3, 6, 5),
            Olustur(1009, "Yıllık strateji dokümanı", "Gelecek yıl hedeflerinin dokümante edilmesi.",
                    25, JobStatus.Beklemede, JobPriority.Dusuk, null, 1, 10, 3),

            // --- unutulmuş iş (45 gün önce açılmış, hâlâ beklemede) ---
            Olustur(1010, "Arşiv düzenleme", "Eski evrak arşivinin dijitalleştirilmesi ve tasnifi.",
                    60, JobStatus.Beklemede, JobPriority.Dusuk, null, null, null, 45),

            // --- tamamlananlar ---
            Olustur(1011, "Haziran ayı kapanışı", "Haziran ayı muhasebe kayıtlarının kapatılması.",
                    -8, JobStatus.Tamamlandi, JobPriority.Normal, null, 1, 2, 25),
            Olustur(1012, "İş sağlığı eğitimi", "Zorunlu iş sağlığı ve güvenliği eğitiminin düzenlenmesi.",
                    -15, JobStatus.Tamamlandi, JobPriority.Dusuk, null, 1, 1, 35),
            Olustur(1013, "Web sitesi yenileme", "Kurumsal web sitesinin yeniden tasarlanması ve yayına alınması.",
                    -4, JobStatus.Tamamlandi, JobPriority.Yuksek, null, 3, 8, 50),

            // --- iptal ---
            Olustur(1014, "Fuar katılımı", "Sektör fuarına stant ile katılım organizasyonu.",
                    20, JobStatus.Iptal, JobPriority.Normal, null, 2, 5, 18)
        );

        await db.SaveChangesAsync();
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AngularApp");
app.UseAuthentication();   // önce authentication
app.UseAuthorization();    // sonra authorization
app.MapControllers();

app.Run();