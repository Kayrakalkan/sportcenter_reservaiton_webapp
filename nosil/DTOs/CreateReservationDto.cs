using System;
using Nosil.Models;

namespace Nosil.DTOs
{
    public class CreateReservationDto
    {
        public Guid UserId { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset EndTime { get; set; }
        public ReservationType Type { get; set; }
    }
}
