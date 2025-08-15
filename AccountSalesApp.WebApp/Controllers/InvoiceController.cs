using AccountSalesApp.WebApp.Models;
using AccountSalesApp.WebApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace AccountSalesApp.WebApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController : ControllerBase
{
    private readonly InvoiceService _invoiceService;

    public InvoiceController(InvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    // GET: api/invoice
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoices()
    {
        var invoices = await _invoiceService.GetInvoicesAsync();
        return Ok(invoices);
    }

    // GET: api/invoice/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Invoice>> GetInvoice(int id)
    {
        var invoice = await _invoiceService.GetInvoiceByIdAsync(id);
        
        if (invoice == null)
        {
            return NotFound();
        }
        
        return Ok(invoice);
    }

    // GET: api/invoice/customer/5
    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<Invoice>>> GetInvoicesByCustomer(int customerId)
    {
        var invoices = await _invoiceService.GetInvoicesByCustomerAsync(customerId);
        return Ok(invoices);
    }

    // GET: api/invoice/statistics
    [HttpGet("statistics")]
    public async Task<ActionResult<InvoiceStatistics>> GetStatistics()
    {
        var statistics = await _invoiceService.GetInvoiceStatisticsAsync();
        return Ok(statistics);
    }

    // POST: api/invoice
    [HttpPost]
    public async Task<ActionResult<Invoice>> CreateInvoice(Invoice invoice)
    {
        try
        {
            var createdInvoice = await _invoiceService.CreateInvoiceAsync(invoice);
            return CreatedAtAction(nameof(GetInvoice), new { id = createdInvoice.Id }, createdInvoice);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT: api/invoice/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateInvoice(int id, Invoice invoice)
    {
        if (id != invoice.Id)
        {
            return BadRequest();
        }

        try
        {
            await _invoiceService.UpdateInvoiceAsync(invoice);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // DELETE: api/invoice/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvoice(int id)
    {
        try
        {
            await _invoiceService.DeleteInvoiceAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/invoice/5/payment
    [HttpPost("{id}/payment")]
    public async Task<ActionResult<Payment>> AddPayment(int id, Payment payment)
    {
        payment.InvoiceId = id;
        
        try
        {
            var createdPayment = await _invoiceService.AddPaymentAsync(payment);
            return Ok(createdPayment);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
