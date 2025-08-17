using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AccountSalesApp.WebApp.Data;
using AccountSalesApp.WebApp.Models;

namespace AccountSalesApp.WebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetProducts()
        {
            try
            {
                var products = await _context.Products
                    .OrderBy(p => p.Name)
                    .ToListAsync();

                var productDtos = products.Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.SKU,
                    p.Type,
                    p.Category,
                    p.Description,
                    p.Price,
                    p.Cost,
                    p.Stock,
                    p.MinStock,
                    p.Status,
                    p.ImageUrl,
                    p.DateCreated,
                    p.DateModified,
                    p.IsService
                });

                return Ok(productDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetProduct(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);

                if (product == null)
                {
                    return NotFound();
                }

                var productDto = new
                {
                    product.Id,
                    product.Name,
                    product.SKU,
                    product.Type,
                    product.Category,
                    product.Description,
                    product.Price,
                    product.Cost,
                    product.Stock,
                    product.MinStock,
                    product.Status,
                    product.ImageUrl,
                    product.DateCreated,
                    product.DateModified,
                    product.IsService
                };

                return Ok(productDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] Product product)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Generate SKU if not provided
                if (string.IsNullOrEmpty(product.SKU))
                {
                    product.SKU = GenerateSKU(product.Type, product.Category);
                }

                product.DateCreated = DateTime.UtcNow;
                product.Status = "Active";

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/products/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
        {
            try
            {
                if (id != product.Id)
                {
                    return BadRequest();
                }

                var existingProduct = await _context.Products.FindAsync(id);
                if (existingProduct == null)
                {
                    return NotFound();
                }

                existingProduct.Name = product.Name;
                existingProduct.SKU = product.SKU;
                existingProduct.Type = product.Type;
                existingProduct.Category = product.Category;
                existingProduct.Description = product.Description;
                existingProduct.Price = product.Price;
                existingProduct.Cost = product.Cost;
                existingProduct.Stock = product.Stock;
                existingProduct.MinStock = product.MinStock;
                existingProduct.Status = product.Status;
                existingProduct.ImageUrl = product.ImageUrl;
                existingProduct.DateModified = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/products/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                {
                    return NotFound();
                }

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/products/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            try
            {
                var categories = await _context.Products
                    .Where(p => !string.IsNullOrEmpty(p.Category))
                    .Select(p => p.Category)
                    .Distinct()
                    .OrderBy(c => c)
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/products/types
        [HttpGet("types")]
        public async Task<ActionResult<IEnumerable<string>>> GetTypes()
        {
            try
            {
                var types = await _context.Products
                    .Where(p => !string.IsNullOrEmpty(p.Type))
                    .Select(p => p.Type)
                    .Distinct()
                    .OrderBy(t => t)
                    .ToListAsync();

                return Ok(types);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private string GenerateSKU(string type, string category)
        {
            var prefix = type.Equals("Service", StringComparison.OrdinalIgnoreCase) ? "SVC" : "PROD";
            var categoryPrefix = string.IsNullOrEmpty(category) ? "GEN" : category.Substring(0, Math.Min(3, category.Length)).ToUpper();
            var timestamp = DateTime.UtcNow.ToString("yyMMddHHmm");
            var random = new Random().Next(100, 999);
            
            return $"{prefix}-{categoryPrefix}-{timestamp}-{random}";
        }
    }
}
