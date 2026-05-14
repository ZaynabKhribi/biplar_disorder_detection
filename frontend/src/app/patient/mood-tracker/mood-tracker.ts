import { Component, OnInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { MoodService } from '../../../core/services/mood.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PremiumGateComponent } from '../../../shared/components/premium-gate/premium-gate';

Chart.register(...registerables);

@Component({
  selector: 'app-mood-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumGateComponent],
  template: `
    <div class="page-wrapper">
      <div class="page-header fade-in-up">
        <h1>Mood Tracker</h1>
        <p>Log your daily mood, sleep, energy, and irritability to track patterns.</p>
      </div>

      <div class="grid-2 fade-in-up">
        <!-- Log Form -->
        <div class="card">
          <h3 class="mb-3">Daily Entry</h3>
          <form (ngSubmit)="submitLog()">
            <div class="form-group">
              <label class="form-label">Date</label>
              <input type="date" class="form-control" [(ngModel)]="log.date" name="date" required />
            </div>

            <div class="form-group">
              <label class="form-label">Mood (1-10) — 1: Depressed, 10: Manic</label>
              <div class="flex items-center gap-2">
                <input type="range" min="1" max="10" [(ngModel)]="log.mood" name="mood" style="flex:1" />
                <span class="val-badge">{{ log.mood }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Sleep (hours)</label>
              <div class="flex items-center gap-2">
                <input type="range" min="0" max="24" step="0.5" [(ngModel)]="log.sleep" name="sleep" style="flex:1" />
                <span class="val-badge">{{ log.sleep }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Energy Level (1-10)</label>
              <div class="flex items-center gap-2">
                <input type="range" min="1" max="10" [(ngModel)]="log.energy" name="energy" style="flex:1" />
                <span class="val-badge">{{ log.energy }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Irritability (1-10)</label>
              <div class="flex items-center gap-2">
                <input type="range" min="1" max="10" [(ngModel)]="log.irritability" name="irritability" style="flex:1" />
                <span class="val-badge">{{ log.irritability }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notes (optional)</label>
              <textarea class="form-control" [(ngModel)]="log.notes" name="notes" placeholder="Any specific triggers or thoughts today?"></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center" [disabled]="loading">
              {{ loading ? 'Saving...' : 'Save Entry' }}
            </button>
          </form>
        </div>

        <!-- Chart Area -->
        <div>
          <app-premium-gate [unlocked]="isPremium" message="Upgrade to Premium to unlock 30-day and 90-day mood analytics, and view detailed historical patterns.">
            <div class="card" style="height:100%">
              <div class="flex justify-between items-center mb-4">
                <h3>Mood History</h3>
                <div class="badge badge-teal" *ngIf="!isPremium">7 Days</div>
                <select class="form-control" style="width:auto;padding:0.25rem 0.5rem" *ngIf="isPremium" (change)="updateChart()" [(ngModel)]="daysView">
                  <option [value]="7">Last 7 Days</option>
                  <option [value]="30">Last 30 Days</option>
                  <option [value]="90">Last 90 Days</option>
                </select>
              </div>

              <div class="chart-container" style="position: relative; height: 350px; width: 100%;">
                <canvas #moodChart></canvas>
              </div>
            </div>
          </app-premium-gate>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .val-badge { width: 36px; height: 36px; border-radius: 8px; background: rgba(0,180,216,0.15); color: #00b4d8; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
  `]
})
export class MoodTrackerComponent implements OnInit {
  @ViewChild('moodChart', { static: false }) chartRef!: ElementRef;
  chart: any;

  auth = inject(AuthService);
  moodService = inject(MoodService);
  notif = inject(NotificationService);

  loading = false;
  logs: any[] = [];
  daysView = 7; // default

  get isPremium() { return this.auth.isPremium(); }

  log = {
    date: new Date().toISOString().split('T')[0],
    mood: 5,
    sleep: 7,
    energy: 5,
    irritability: 2,
    notes: ''
  };

  ngOnInit() {
    this.daysView = this.isPremium ? 30 : 7;
    this.loadLogs();
  }

  loadLogs() {
    const user = this.auth.currentUser();
    if (!user) return;
    this.moodService.getLogs(user.id).subscribe({
      next: (data) => {
        this.logs = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setTimeout(() => this.updateChart(), 100);
      }
    });
  }

  submitLog() {
    this.loading = true;
    this.moodService.createLog(this.log).subscribe({
      next: () => {
        this.notif.success('Log saved successfully');
        this.loading = false;
        this.log.notes = ''; // reset notes
        this.loadLogs();
      },
      error: () => {
        this.notif.error('Failed to save log');
        this.loading = false;
      }
    });
  }

  updateChart() {
    if (!this.chartRef) return;
    
    // Filter logs based on daysView
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.daysView);
    const filteredLogs = this.logs.filter(l => new Date(l.date) >= cutoffDate);

    const labels = filteredLogs.map(l => l.date);
    const moodData = filteredLogs.map(l => l.mood);
    const energyData = filteredLogs.map(l => l.energy);

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Mood',
            data: moodData,
            borderColor: '#00b4d8',
            backgroundColor: 'rgba(0,180,216,0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Energy',
            data: energyData,
            borderColor: '#a855f7',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            hidden: true // hide by default
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#f0f8ff' } }
        },
        scales: {
          y: {
            min: 0, max: 10,
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8' }
          },
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }
}
