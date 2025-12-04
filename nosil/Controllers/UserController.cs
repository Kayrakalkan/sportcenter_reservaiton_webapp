using Microsoft.AspNetCore.Mvc;
using Nosil.Data;
using Nosil.Models;
using System.Linq;

namespace Nosil.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login/admin")]
        public IActionResult AdminLogin([FromBody] UserLogin model)
        {
            var user = _context.Users
                .FirstOrDefault(u => u.Username == model.Username && u.Password == model.Password && u.Role == UserRole.Admin);

            if (user == null)
                return Unauthorized("Invalid admin username or password");

            return Ok("Admin login is successful!");
        }

        [HttpPost("login/faculty")]
        public IActionResult FacultyLogin([FromBody] UserLogin model)
        {
            var user = _context.Users
                .FirstOrDefault(u => u.Username == model.Username && u.Password == model.Password && u.Role == UserRole.Faculty);

            if (user == null)
                return Unauthorized("Invalid faculty username or password");

            return Ok("Faculty login is successful!");
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            var users = _context.Users.Select(u => new
            {
                u.Id,
                u.Username,
                u.Role
            }).ToList();
            
            return Ok(users);
        }
    }
    

    public class UserLogin
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
