import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConnectivityService } from './services/connectivity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'medlo';
  
  constructor(private connectivityService: ConnectivityService) {}
  
  ngOnInit() {
    // Delayed backend check to ensure UI loads first
    setTimeout(() => {
      // Check backend connectivity after app init
      this.connectivityService.checkBackendConnectivity().subscribe({
        next: (isConnected) => {
          console.log('Backend connectivity status:', isConnected ? 'Connected' : 'Not connected');
        },
        error: (err) => {
          console.error('Error checking backend connectivity:', err);
        }
      });
    }, 1000);
  }
}
