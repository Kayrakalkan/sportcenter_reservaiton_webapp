using Nosil.Data;
using Nosil.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Nosil.Services
{
    public class ReservationService
    {
        private readonly AppDbContext _context;

        public ReservationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Reservation>> GetAllReservationsAsync()
        {
            return await _context.Reservations
                .Include(r => r.User) // Eagerly load the User property
                .ToListAsync();
        }

        public async Task<Reservation> GetReservationByIdAsync(Guid id)
        {
            return await _context.Reservations
                .Include(r => r.User) // Eagerly load the User property
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Reservation> CreateReservationAsync(Reservation reservation)
        {
            // Normalize StartTime and EndTime to UTC
            reservation.StartTime = reservation.StartTime.ToUniversalTime();
            reservation.EndTime = reservation.EndTime.ToUniversalTime();

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();
            return reservation;
        }

        public async Task<bool> DeleteReservationAsync(Guid id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null)
                return false;

            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsAvailableAsync(DateTime startTime, DateTime endTime)
        {
            // Ensure the input times are in UTC
            startTime = startTime.ToUniversalTime();
            endTime = endTime.ToUniversalTime();

            // Fetch conflicting reservations
            var conflictingReservations = await _context.Reservations
                .Where(r => r.StartTime < endTime && r.EndTime > startTime)
                .ToListAsync();

            // Debug: Log conflicting reservations
            foreach (var r in conflictingReservations)
            {
                Console.WriteLine($"Conflicting reservation: {r.StartTime} - {r.EndTime}");
            }

            return !conflictingReservations.Any();
        }

        public async Task<bool> HasReservationThisWeekAsync(Guid userId, DateTime startOfWeek, DateTime endOfWeek)
        {
            return await _context.Reservations.AnyAsync(r =>
                r.UserId == userId &&
                r.StartTime >= startOfWeek &&
                r.StartTime < endOfWeek
            );
        }

        public async Task<IEnumerable<Reservation>> GetConflictingReservationsAsync(DateTime startTime, DateTime endTime)
        {
            return await _context.Reservations
                .Where(r => r.StartTime < endTime && r.EndTime > startTime)
                .ToListAsync();
        }
    }
}

