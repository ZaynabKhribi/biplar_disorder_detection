import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-nearby-psychologists',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header fade-in-up">
        <h1>Find Providers</h1>
        <p>Locate mental health professionals near your current location.</p>
      </div>

      <div class="card mb-4 fade-in-up">
        <div class="flex justify-between items-center mb-2">
          <h3>Nearby Mental Health Professionals</h3>
          <button class="btn btn-primary" (click)="locateAndSearch()" [disabled]="loading">
            {{ loading ? 'Searching...' : 'Search Near Me' }}
          </button>
        </div>
        <p class="text-muted" style="font-size:0.9rem">
          We use your browser's location to securely query the Google Places API. 
        </p>
      </div>

      <!-- Warning if API key missing -->
      <div *ngIf="apiWarning" class="card card-gradient text-center mb-4 fade-in-up" style="border-color:#eab308">
        <h3 class="text-yellow mb-2">Google Maps API Key Not Configured</h3>
        <p class="text-muted mb-0">The backend requires a valid GOOGLE_MAPS_API_KEY in its .env file to fetch real data. Please add it to see actual providers.</p>
      </div>

      <div class="grid-2 fade-in-up" *ngIf="providers.length > 0">
        <div *ngFor="let p of providers" class="provider-card">
          <div class="p-header">
            <h4>{{ p.name }}</h4>
            <div class="badge badge-indigo">Provider</div>
          </div>
          <div class="p-body">
            <p><strong>Address:</strong> {{ p.address }}</p>
            <p *ngIf="p.rating"><strong>Rating:</strong> ⭐ {{ p.rating }} ({{ p.user_ratings_total }} reviews)</p>
            <p *ngIf="p.open_now !== undefined">
              <strong>Status:</strong> 
              <span [class.text-green]="p.open_now" [class.text-red]="!p.open_now">
                {{ p.open_now ? 'Open Now' : 'Closed' }}
              </span>
            </p>
          </div>
          <div class="p-footer">
            <a [href]="'https://www.google.com/maps/search/?api=1&query=' + p.lat + ',' + p.lng" target="_blank" class="btn btn-secondary btn-sm">
              View on Google Maps
            </a>
          </div>
        </div>
      </div>

      <div *ngIf="searched && providers.length === 0 && !apiWarning && !loading" class="text-center mt-4 text-muted">
        No providers found in your immediate area.
      </div>
    </div>
  `,
  styles: [`
    .provider-card {
      background: rgba(22,32,50,0.6); border: 1px solid rgba(0,180,216,0.15);
      border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column;
    }
    .p-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .p-header h4 { margin: 0; padding-right: 1rem; }
    .p-body p { font-size: 0.9rem; color: #cbd5e1; margin-bottom: 0.5rem; }
    .p-body strong { color: #f0f8ff; }
    .p-footer { margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); }
  `]
})
export class NearbyPsychologistsComponent {
  http = inject(HttpClient);
  notif = inject(NotificationService);

  loading = false;
  searched = false;
  apiWarning = false;
  providers: any[] = [];

  locateAndSearch() {
    this.loading = true;
    this.searched = true;
    this.apiWarning = false;

    if (!navigator.geolocation) {
      this.notif.error('Geolocation is not supported by your browser');
      this.loading = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.fetchProviders(lat, lng);
      },
      (err) => {
        this.notif.error('Could not get location. Please enable location services.');
        this.loading = false;
      }
    );
  }

  fetchProviders(lat: number, lng: number) {
    this.http.get<any>(`/api/v1/reports/nearby-psychologists?lat=${lat}&lng=${lng}`).subscribe({
      next: (res) => {
        this.providers = res.data || [];
        if (res.message && res.message.includes('API key not configured')) {
          this.apiWarning = true;
        }
        this.loading = false;
      },
      error: () => {
        this.notif.error('Error fetching providers');
        this.loading = false;
      }
    });
  }
}
