using System;
using Nosil.Models;

public class Reservation
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset StartTime { get; set; }  // UTC'de zaman
    public DateTimeOffset EndTime { get; set; }    // UTC'de zaman
    public ReservationType Type { get; set; }
    public User User { get; set; }
}

public enum ReservationType
{
    Training = 0,
    Event = 1 
}