using EnvironmentalPlatform_Sakellariou.Server.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EnvironmentalPlatform_Sakellariou.Server.Controllers
{
    [Route("api/categories")]
    [ApiController]
    [EnableCors("AllowAllOrigins")]
    public class CategoriesController : ControllerBase
    {
        private readonly SocialEnvironmentalPlatformContext _context;

        public CategoriesController(SocialEnvironmentalPlatformContext context)
        {
            _context = context;
        }

        // GET: api/Categories
        [HttpGet]
        public ActionResult<IEnumerable<Category>> GetCategories()
        {
            return Ok(_context.Categories.ToList());
        }

        // POST: api/Categories
        [HttpPost]
        public ActionResult<Category> AddCategory([FromBody] CategoryDto categoryDto)
        {
            if (categoryDto == null || string.IsNullOrWhiteSpace(categoryDto.Name))
            {
                return BadRequest("Category name is required.");
            }

            // Generate a unique category ID
            int newCategoryId;
            var random = new Random();
            do
            {
                newCategoryId = random.Next(100000, 999999); // 6-digit unique ID
            } while (_context.Categories.Any(e => e.CategoryId == newCategoryId));

            // Create a new Category entity from DTO
            var category = new Category
            {
                CategoryId = newCategoryId,
                Name = categoryDto.Name,
                Description = categoryDto.Description
            };

            _context.Categories.Add(category);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetCategories), new { id = category.CategoryId }, category);
        }

        public class CategoryDto
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
        }


        // DELETE: api/Categories/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteCategory(int id)
        {
            var category = _context.Categories.Find(id);
            if (category == null)
            {
                return NotFound();
            }

            _context.Categories.Remove(category);
            _context.SaveChanges();
            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category updatedCategory)
        {
            if (updatedCategory == null || id != updatedCategory.CategoryId)
            {
                return BadRequest(new { error = "Invalid request data" });
            }

            var existingCategory = await _context.Categories.FindAsync(id);
            if (existingCategory == null)
            {
                return NotFound(new { error = "Category not found" });
            }

            // Update properties
            existingCategory.Name = updatedCategory.Name;
            existingCategory.Description = updatedCategory.Description;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Category updated successfully", category = existingCategory });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while updating the category", details = ex.Message });
            }
        }

        // GET: api/Categories/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound(new { error = "Category not found" });
            }

            return Ok(category);
        }






    }
}
