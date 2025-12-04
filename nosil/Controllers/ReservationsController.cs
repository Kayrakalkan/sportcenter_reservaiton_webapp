using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nosil.Data;
using Nosil.DTOs;
using Nosil.Models;
using Nosil.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Nosil.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly ReservationService _reservationService;
        private readonly AppDbContext _context;

        public ReservationsController(ReservationService reservationService, AppDbContext context)
        {
            _reservationService = reservationService;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetReservations()
        {
            var reservations = await _reservationService.GetAllReservationsAsync();
            var reservationDtos = reservations.Select(r => new ReservationDto
            {
                Id = r.Id,
                UserId = r.UserId,
                StartTime = r.StartTime,
                EndTime = r.EndTime,
                Type = (int)r.Type,
                Username = r.User?.Username // Map the username
            });

            return Ok(reservationDtos);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationDto reservationDto)
        {
            // Check if the reservation has a valid UserId
            if (reservationDto.UserId == Guid.Empty)
            {
                return BadRequest("UserId is required to create a reservation.");
            }
            
            // Check if the user exists
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == reservationDto.UserId);
            if (user == null)
            {
                return BadRequest("User not found. Cannot create reservation for a non-existent user.");
            }
            
            // Create a new Reservation from the DTO
            var reservation = new Reservation
            {
                UserId = reservationDto.UserId,
                StartTime = reservationDto.StartTime,
                EndTime = reservationDto.EndTime,
                Type = reservationDto.Type
            };

            // Convert DateTimeOffset to DateTime for compatibility with ReservationService
            var startTime = reservationDto.StartTime.UtcDateTime;
            var endTime = reservationDto.EndTime.UtcDateTime;

            // Check for weekly reservation limit
            var startOfWeek = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek); // Monday
            var endOfWeek = startOfWeek.AddDays(7); // Sunday night

            var hasReservationThisWeek = await _reservationService.HasReservationThisWeekAsync(reservation.UserId, startOfWeek, endOfWeek);
            if (hasReservationThisWeek)
            {
                return BadRequest("You can only make one reservation per week.");
            }

            // Ensure reservation duration is exactly 1 hour
            if ((endTime - startTime).TotalHours != 1)
            {
                return BadRequest("Reservation must be exactly 1 hour long.");
            }

            // Check availability
            if (!await _reservationService.IsAvailableAsync(startTime, endTime))
            {
                var conflictingReservations = await _reservationService.GetConflictingReservationsAsync(startTime, endTime);
                var conflictingDetails = string.Join(", ", conflictingReservations.Select(r => $"{r.StartTime} - {r.EndTime}"));

                return BadRequest($"This time slot is already taken. Conflicting reservations: {conflictingDetails}");
            }

            var createdReservation = await _reservationService.CreateReservationAsync(reservation);
            return CreatedAtAction(nameof(GetReservations), new { id = createdReservation.Id }, createdReservation);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(Guid id)
        {
            var result = await _reservationService.DeleteReservationAsync(id);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
