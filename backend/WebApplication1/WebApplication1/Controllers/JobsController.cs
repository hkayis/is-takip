using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Application.DTOs;
using WebApplication1.Application.Services;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class JobsController : ControllerBase
    {
        private readonly JobService _service;

        public JobsController(JobService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<JobListDto>>> Get()
        {
            return Ok(await _service.GetAllAsync());

        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<JobDetailDto>> GetById(int id)
        {

            var sonuc = await _service.GetByIdAsync(id);

            if (sonuc == null)
            {
                return NotFound();
            }
            return Ok(sonuc);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateJobDto dto)
        {
            if (await _service.IdKullanimdaMi(dto.Id))
            {
                return Conflict(new { message = $"{dto.Id} numaralı iş zaten var." });
            }

            var job = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = job.Id }, null);
        }
        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id,[FromBody] UpdateJobDto dto)
        {
            if (await _service.UpdateAsync(id, dto))
                return NoContent();
            return NotFound(new { message = "İş bulunamadı." });
        }
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            if (await _service.DeleteAsync(id))
            {

                return NoContent();
            }
            return NotFound();
        }

        [HttpPatch("{id:int}/status")]
        public async Task<ActionResult> ChangeStatus(int id, ChangeStatusDto dto)
       => await _service.ChangeStatusAsync(id, dto) ? NoContent() : NotFound();
    }
}
