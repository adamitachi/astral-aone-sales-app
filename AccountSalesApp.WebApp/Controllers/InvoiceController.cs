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
    public async Task<ActionResult<IEnumerable<object>>> GetInvoices()
    {
        var invoices = await _invoiceService.GetInvoicesAsync();
        
        // Return clean DTOs to avoid circular references
        var responseDtos = invoices.Select(invoice => new
        {
            id = invoice.Id,
            invoiceNumber = invoice.InvoiceNumber,
            customerId = invoice.CustomerId,
            invoiceDate = invoice.InvoiceDate,
            dueDate = invoice.DueDate,
            status = invoice.Status,
            subTotal = invoice.SubTotal,
            taxRate = invoice.TaxRate,
            taxAmount = invoice.TaxAmount,
            discountAmount = invoice.DiscountAmount,
            totalAmount = invoice.TotalAmount,
            notes = invoice.Notes,
            terms = invoice.Terms,
            currency = invoice.Currency,
            createdAt = invoice.CreatedAt,
            updatedAt = invoice.UpdatedAt,
            paidAmount = invoice.PaidAmount,
            paidDate = invoice.PaidDate,
            customer = invoice.Customer != null ? new
            {
                id = invoice.Customer.Id,
                name = invoice.Customer.Name,
                email = invoice.Customer.Email,
                phoneNumber = invoice.Customer.PhoneNumber,
                status = invoice.Customer.Status
            } : null,
            items = invoice.Items?.Select(item => new
            {
                id = item.Id,
                description = item.Description,
                quantity = item.Quantity,
                unitPrice = item.UnitPrice,
                lineTotal = item.LineTotal,
                unit = item.Unit,
                productCode = item.ProductCode,
                taxRate = item.TaxRate,
                sortOrder = item.SortOrder
            }).ToList()
        });
        
        return Ok(responseDtos);
    }

    // GET: api/invoice/5
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetInvoice(int id)
    {
        var invoice = await _invoiceService.GetInvoiceByIdAsync(id);
        
        if (invoice == null)
        {
            return NotFound();
        }
        
        // Return clean DTO to avoid circular references
        var responseDto = new
        {
            id = invoice.Id,
            invoiceNumber = invoice.InvoiceNumber,
            customerId = invoice.CustomerId,
            invoiceDate = invoice.InvoiceDate,
            dueDate = invoice.DueDate,
            status = invoice.Status,
            subTotal = invoice.SubTotal,
            taxRate = invoice.TaxRate,
            taxAmount = invoice.TaxAmount,
            discountAmount = invoice.DiscountAmount,
            totalAmount = invoice.TotalAmount,
            notes = invoice.Notes,
            terms = invoice.Terms,
            currency = invoice.Currency,
            createdAt = invoice.CreatedAt,
            updatedAt = invoice.UpdatedAt,
            paidAmount = invoice.PaidAmount,
            paidDate = invoice.PaidDate,
            customer = invoice.Customer != null ? new
            {
                id = invoice.Customer.Id,
                name = invoice.Customer.Name,
                email = invoice.Customer.Email,
                phoneNumber = invoice.Customer.PhoneNumber,
                status = invoice.Customer.Status
            } : null,
            items = invoice.Items?.Select(item => new
            {
                id = item.Id,
                description = item.Description,
                quantity = item.Quantity,
                unitPrice = item.UnitPrice,
                lineTotal = item.LineTotal,
                unit = item.Unit,
                productCode = item.ProductCode,
                taxRate = item.TaxRate,
                sortOrder = item.SortOrder
            }).ToList()
        };
        
        return Ok(responseDto);
    }

    // GET: api/invoice/customer/5
    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetInvoicesByCustomer(int customerId)
    {
        var invoices = await _invoiceService.GetInvoicesByCustomerAsync(customerId);
        
        // Return clean DTOs to avoid circular references
        var responseDtos = invoices.Select(invoice => new
        {
            id = invoice.Id,
            invoiceNumber = invoice.InvoiceNumber,
            customerId = invoice.CustomerId,
            invoiceDate = invoice.InvoiceDate,
            dueDate = invoice.DueDate,
            status = invoice.Status,
            subTotal = invoice.SubTotal,
            taxRate = invoice.TaxRate,
            taxAmount = invoice.TaxAmount,
            discountAmount = invoice.DiscountAmount,
            totalAmount = invoice.TotalAmount,
            notes = invoice.Notes,
            terms = invoice.Terms,
            currency = invoice.Currency,
            createdAt = invoice.CreatedAt,
            updatedAt = invoice.UpdatedAt,
            paidAmount = invoice.PaidAmount,
            paidDate = invoice.PaidDate,
            customer = invoice.Customer != null ? new
            {
                id = invoice.Customer.Id,
                name = invoice.Customer.Name,
                email = invoice.Customer.Email,
                phoneNumber = invoice.Customer.PhoneNumber,
                status = invoice.Customer.Status
            } : null,
            items = invoice.Items?.Select(item => new
            {
                id = item.Id,
                description = item.Description,
                quantity = item.Quantity,
                unitPrice = item.UnitPrice,
                lineTotal = item.LineTotal,
                unit = item.Unit,
                productCode = item.ProductCode,
                taxRate = item.TaxRate,
                sortOrder = item.SortOrder
            }).ToList()
        });
        
        return Ok(responseDtos);
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
    public async Task<ActionResult<object>> CreateInvoice(CreateInvoiceDto invoiceDto)
    {
        try
        {
            // Check model state for validation errors
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Count > 0)
                    .Select(x => new { Field = x.Key, Errors = x.Value.Errors.Select(e => e.ErrorMessage) })
                    .ToArray();
                
                return BadRequest(new { message = "Validation failed", errors = errors });
            }

            // Convert DTO to Invoice entity
            var invoice = new Invoice
            {
                CustomerId = invoiceDto.CustomerId,
                InvoiceDate = invoiceDto.InvoiceDate,
                DueDate = invoiceDto.DueDate,
                Status = invoiceDto.Status,
                SubTotal = invoiceDto.SubTotal,
                TaxRate = invoiceDto.TaxRate,
                TaxAmount = invoiceDto.TaxAmount,
                DiscountAmount = invoiceDto.DiscountAmount,
                TotalAmount = invoiceDto.TotalAmount,
                Notes = invoiceDto.Notes,
                Terms = invoiceDto.Terms,
                Currency = invoiceDto.Currency,
                PaidAmount = invoiceDto.PaidAmount,
                Items = invoiceDto.Items.Select(itemDto => new InvoiceItem
                {
                    Description = itemDto.Description,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice,
                    LineTotal = itemDto.LineTotal,
                    Unit = itemDto.Unit,
                    ProductCode = itemDto.ProductCode,
                    TaxRate = itemDto.TaxRate,
                    SortOrder = itemDto.SortOrder
                }).ToList()
            };

            var createdInvoice = await _invoiceService.CreateInvoiceAsync(invoice);
            
            // Return a clean response DTO to avoid circular references
            var responseDto = new
            {
                id = createdInvoice.Id,
                invoiceNumber = createdInvoice.InvoiceNumber,
                customerId = createdInvoice.CustomerId,
                invoiceDate = createdInvoice.InvoiceDate,
                dueDate = createdInvoice.DueDate,
                status = createdInvoice.Status,
                subTotal = createdInvoice.SubTotal,
                taxRate = createdInvoice.TaxRate,
                taxAmount = createdInvoice.TaxAmount,
                discountAmount = createdInvoice.DiscountAmount,
                totalAmount = createdInvoice.TotalAmount,
                notes = createdInvoice.Notes,
                terms = createdInvoice.Terms,
                currency = createdInvoice.Currency,
                createdAt = createdInvoice.CreatedAt,
                updatedAt = createdInvoice.UpdatedAt,
                paidAmount = createdInvoice.PaidAmount,
                paidDate = createdInvoice.PaidDate,
                items = createdInvoice.Items?.Select(item => new
                {
                    id = item.Id,
                    description = item.Description,
                    quantity = item.Quantity,
                    unitPrice = item.UnitPrice,
                    lineTotal = item.LineTotal,
                    unit = item.Unit,
                    productCode = item.ProductCode,
                    taxRate = item.TaxRate,
                    sortOrder = item.SortOrder
                }).ToList()
            };
            
            return CreatedAtAction(nameof(GetInvoice), new { id = createdInvoice.Id }, responseDto);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, stackTrace = ex.StackTrace });
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
