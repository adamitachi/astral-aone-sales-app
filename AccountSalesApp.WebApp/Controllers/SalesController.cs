using AccountSalesApp.WebApp.Data;
using AccountSalesApp.WebApp.Models;
using Microsoft.AspNetCore.Mvc;

namespace AccountSalesApp.WebApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly AppDataService _dataService;

    public SalesController(AppDataService dataService)
    {
        _dataService = dataService;
    }

    // GET: /api/sales
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Sale>>> GetSales()
    {
        var sales = await _dataService.GetAllSalesAsync();
        return Ok(sales);
    }

    // GET: /api/sales/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Sale>> GetSale(int id)
    {
        var sales = await _dataService.GetAllSalesAsync();
        var sale = sales.FirstOrDefault(s => s.Id == id);
        
        if (sale == null)
        {
            return NotFound();
        }
        
        return Ok(sale);
    }

    // POST: /api/sales
    [HttpPost]
    public async Task<ActionResult<Sale>> PostSale(Sale sale)
    {
        await _dataService.AddSaleAsync(sale);
        return CreatedAtAction(nameof(GetSale), new { id = sale.Id }, sale);
    }

    // PUT: /api/sales/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutSale(int id, Sale sale)
    {
        if (id != sale.Id)
        {
            return BadRequest();
        }

        await _dataService.UpdateSaleAsync(sale);
        return NoContent();
    }

    // DELETE: /api/sales/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSale(int id)
    {
        await _dataService.DeleteSaleAsync(id);
        return NoContent();
    }
}
