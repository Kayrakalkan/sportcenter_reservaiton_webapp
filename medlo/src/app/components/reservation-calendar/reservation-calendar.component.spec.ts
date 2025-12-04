import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationCalendarComponent } from './reservation-calendar.component';

describe('ReservationCalendarComponent', () => {
  let component: ReservationCalendarComponent;
  let fixture: ComponentFixture<ReservationCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should generate sample reservations', () => {
    component.generateSampleReservations();
    expect(component.reservations.length).toBeGreaterThan(0);
  });
  
  it('should identify reserved slots correctly', () => {
    // Create a sample reservation
    const today = new Date();
    const reservation = {
      id: '1',
      userId: 'test',
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      type: 0, // Training
      username: 'Test User'
    };
    component.reservations = [reservation];
    
    // Check if the slot is identified as reserved
    const isReserved = component.isReserved(today, '10:00');
    expect(isReserved).toBeTruthy();
  });
});
