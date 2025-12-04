using System;

namespace Nosil.DTOs
{
    public class ReservationDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset EndTime { get; set; }
        public int Type { get; set; }
        public string Username { get; set; } // Include only the username
    }
}
