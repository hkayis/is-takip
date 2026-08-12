using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Application.DTOs;
using WebApplication1.Application.Services;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly ReportService _service;

        public ReportsController(ReportService service)
        {
            _service = service;
        }

        [HttpGet("asama-sureleri")]
        public async Task<ActionResult<List<AsamaSuresiDto>>> AsamaSureleri()
        {
            return Ok(await _service.AsamaSureleriAsync());
        }
    }
}