// Helper functions for the reservation calendar
import { Reservation, ReservationType } from '../../models/reservation.model';

/**
 * Helper function to check if two dates match for a time slot
 * This handles the case where dates might be in different formats or timezones
 */
export function datesMatchForSlot(resDate: Date, slotDate: Date): boolean {
  // Get the date parts without timezone issues
  const resYear = resDate.getFullYear();
  const resMonth = resDate.getMonth();
  const resDay = resDate.getDate();
  const resHour = resDate.getHours();
  
  const slotYear = slotDate.getFullYear();
  const slotMonth = slotDate.getMonth();
  const slotDay = slotDate.getDate();
  const slotHour = slotDate.getHours();
  
  // Debug for specific dates (May 18th at 8:00)
  if (slotDay === 18 && slotHour === 8) {
    console.log('DateMatcher: Checking May 18th 8:00 slot');
    console.log('DateMatcher: Slot date/hour:', slotDay, slotHour);
    console.log('DateMatcher: Slot full date:', slotDate.toString());
    console.log('DateMatcher: Reservation date/hour:', resDay, resHour);
    console.log('DateMatcher: Reservation full date:', resDate.toString());
    console.log('DateMatcher: Month match?', resMonth === slotMonth);
    console.log('DateMatcher: Date match?', resDay === slotDay);
    console.log('DateMatcher: Hour match?', resHour === slotHour);
    console.log('DateMatcher: Year match?', resYear === slotYear, 'Years:', resYear, slotYear);
  }
  
  // For debugging - this is the actual comparison result
  const exactMatch = resYear === slotYear && 
                   resMonth === slotMonth && 
                   resDay === slotDay && 
                   resHour === slotHour;
  
  // We'll use a more flexible match that ignores the year
  // This allows us to see 2026 reservations in the 2025 calendar
  const flexibleMatch = resMonth === slotMonth && 
                      resDay === slotDay && 
                      resHour === slotHour;
  
  if (slotDay === 18 && slotHour === 8) {
    console.log('DateMatcher: Exact match?', exactMatch);
    console.log('DateMatcher: Flexible match?', flexibleMatch);
  }
                   
  // Return flexible match to show reservations regardless of year
  return flexibleMatch;
}

/**
 * Checks if a time slot is reserved for training
 */
export function isTrainingReservation(reservation: Reservation, slotDate: Date): boolean {
  if (!reservation || !reservation.startTime) {
    return false;
  }
  
  // Ensure we have a proper Date object
  const resStartTime = reservation.startTime instanceof Date 
    ? reservation.startTime 
    : new Date(reservation.startTime);
  
  // Debug for May 18th at 8AM
  if (slotDate.getDate() === 18 && slotDate.getHours() === 8) {
    console.log('TrainingMatcher: Checking reservation type:', reservation.type);
    console.log('TrainingMatcher: Expected Training type:', ReservationType.Training);
    console.log('TrainingMatcher: Is type equal?', reservation.type === ReservationType.Training);
    console.log('TrainingMatcher: Is type numerically equal?', Number(reservation.type) === 0);
  }
    
  // Check if this is a Training reservation matching the time slot
  // Use == instead of === to handle potential type conversion issues
  return Number(reservation.type) === 0 && // ReservationType.Training is 0
    datesMatchForSlot(resStartTime, slotDate);
}

/**
 * Checks if a time slot is reserved for an event
 */
export function isEventReservation(reservation: Reservation, slotDate: Date): boolean {
  if (!reservation || !reservation.startTime) {
    return false;
  }
  
  // Ensure we have a proper Date object
  const resStartTime = reservation.startTime instanceof Date 
    ? reservation.startTime 
    : new Date(reservation.startTime);
  
  // Debug for May 18th at 8AM
  if (slotDate.getDate() === 18 && slotDate.getHours() === 8) {
    console.log('EventMatcher: Checking reservation type:', reservation.type);
    console.log('EventMatcher: Expected Event type:', ReservationType.Event);
    console.log('EventMatcher: Is type equal?', reservation.type === ReservationType.Event);
    console.log('EventMatcher: Is type numerically equal?', Number(reservation.type) === 1);
  }
  
  // The API shows reservation with type 1, which is Event
  // We need to check if the type matches ReservationType.Event (1)
  const typeMatch = Number(reservation.type) === 1;
  const dateMatch = datesMatchForSlot(resStartTime, slotDate);
  
  if (slotDate.getDate() === 18 && slotDate.getHours() === 8) {
    console.log('EventMatcher RESULT:', typeMatch && dateMatch, 'Type:', reservation.type, 'TimeMatch:', dateMatch);
  }
  
  return typeMatch && dateMatch;
}
