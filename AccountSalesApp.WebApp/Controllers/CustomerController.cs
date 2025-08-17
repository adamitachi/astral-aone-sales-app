using AccountSalesApp.WebApp.Data;
using AccountSalesApp.WebApp.Models;
using Microsoft.AspNetCore.Mvc;

namespace AccountSalesApp.WebApp.Controllers;

[ApiController]
[Route("api/[controller]")] // This means the URL will be /api/customers
public class CustomersController : ControllerBase
{
    private readonly AppDataService _dataService;

    public CustomersController(AppDataService dataService)
    {
        _dataService = dataService;
    }

    // GET: /api/customers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetCustomers()
    {
        var customers = await _dataService.GetCustomersAsync();
        
        // Return clean DTOs to avoid circular references
        var responseDtos = customers.Select(customer => new
        {
            id = customer.Id,
            name = customer.Name,
            email = customer.Email,
            phoneNumber = customer.PhoneNumber,
            dateCreated = customer.DateCreated,
            status = customer.Status,
            totalSpent = customer.TotalSpent
        });
        
        return Ok(responseDtos);
    }

    // GET: /api/customers/5
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetCustomer(int id)
    {
        var customer = await _dataService.GetCustomerByIdAsync(id);
        if (customer == null)
        {
            return NotFound();
        }
        
        // Return clean DTO to avoid circular references
        var responseDto = new
        {
            id = customer.Id,
            name = customer.Name,
            email = customer.Email,
            phoneNumber = customer.PhoneNumber,
            dateCreated = customer.DateCreated,
            status = customer.Status,
            totalSpent = customer.TotalSpent
        };
        
        return Ok(responseDto);
    }

    // POST: /api/customers
    [HttpPost]
    public async Task<ActionResult<Customer>> PostCustomer(Customer customer)
    {
        await _dataService.AddCustomerAsync(customer);
        // Returns the created customer with its new ID
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    // POST: /api/customers/sale
    [HttpPost("sale")]
    public async Task<IActionResult> PostSale(Sale sale)
    {
        await _dataService.AddSaleAsync(sale);
        return NoContent();
    }

    // PUT: /api/customers/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutCustomer(int id, Customer customer)
    {
        if (id != customer.Id)
        {
            return BadRequest();
        }

        await _dataService.UpdateCustomerAsync(customer);
        return NoContent();
    }

    // DELETE: /api/customers/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(int id)
    {
        var customer = await _dataService.GetCustomerByIdAsync(id);
        if (customer == null)
        {
            return NotFound();
        }

        await _dataService.DeleteCustomerAsync(id);
        return NoContent();
    }

    // GET: /api/customers/5/sales
    [HttpGet("{id}/sales")]
    public async Task<ActionResult<IEnumerable<object>>> GetCustomerSales(int id)
    {
        var sales = await _dataService.GetSalesByCustomerAsync(id);
        
        // Return clean DTOs to avoid circular references
        var responseDtos = sales.Select(sale => new
        {
            id = sale.Id,
            customerId = sale.CustomerId,
            amount = sale.Amount,
            saleDate = sale.SaleDate,
            description = sale.Description
        });
        
        return Ok(responseDtos);
    }
}