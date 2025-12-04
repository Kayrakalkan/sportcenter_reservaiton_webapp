using System;

namespace Nosil.Models
{
    public enum UserRole
    {
    Admin = 0,
    Faculty = 1
            }

    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; }
    }
}
