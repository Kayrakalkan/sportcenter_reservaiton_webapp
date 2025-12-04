export enum ReservationType {
  Training = 0, // Changed to match backend enum values
  Event = 1
}

export interface Reservation {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  type: ReservationType;
  username?: string; // Optional field to display the username
}
