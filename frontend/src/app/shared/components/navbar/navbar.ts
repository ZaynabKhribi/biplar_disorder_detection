import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <!-- Logo -->
        <a class="nav-brand" routerLink="/">
          <span class="brand-icon">🧠</span>
          <span class="brand-text">BipolarGuide</span>
        </a>

        <!-- Nav links -->
        <div class="nav-links" *ngIf="auth.isLoggedIn()">
          <!-- Patient links -->
          <ng-container *ngIf="auth.currentUser()?.role === 'patient'">
            <a routerLink="/patient/questionnaire" routerLinkActive="active">Assessment</a>
            <a routerLink="/patient/results"       routerLinkActive="active">Results</a>
            <a routerLink="/patient/mood-tracker"  routerLinkActive="active">Mood</a>
            <a routerLink="/patient/nearby-psychologists" routerLinkActive="active" *ngIf="isPremium()">
              Find Providers
            </a>
            <a routerLink="/patient/report" routerLinkActive="active" *ngIf="isPremium()">
              Report
            </a>
          </ng-container>

          <!-- Professional links -->
          <ng-container *ngIf="auth.currentUser()?.role === 'professional'">
            <a routerLink="/professional/patients" routerLinkActive="active">Patients</a>
          </ng-container>

          <!-- Admin links -->
          <ng-container *ngIf="auth.currentUser()?.role === 'admin'">
            <a routerLink="/admin/users"            routerLinkActive="active">Users</a>
            <a routerLink="/admin/model-monitoring" routerLinkActive="active">Model</a>
            <a routerLink="/admin/audit-logs"       routerLinkActive="active">Audit</a>
            <a routerLink="/admin/settings"         routerLinkActive="active">Settings</a>
          </ng-container>
        </div>

        <!-- Right side -->
        <div class="nav-right" *ngIf="auth.isLoggedIn()">
          <!-- Plan badge -->
          <span class="plan-badge" [class.premium]="isPremium()">
            {{ isPremium() ? '⭐ Premium' : 'Free' }}
          </span>

          <!-- Upgrade CTA -->
          <a *ngIf="!isPremium() && auth.currentUser()?.role === 'patient'"
             routerLink="/auth/upgrade" class="btn-upgrade">
            Upgrade
          </a>

          <!-- Avatar dropdown -->
          <div class="avatar-wrap" (click)="toggleMenu()" [class.open]="menuOpen">
            <div class="avatar">{{ initials() }}</div>
            <div class="dropdown" *ngIf="menuOpen">
              <div class="dropdown-header">
                <div class="d-name">{{ auth.currentUser()?.name }}</div>
                <div class="d-email">{{ auth.currentUser()?.email }}</div>
              </div>
              <hr>
              <button (click)="auth.logout()">Sign out</button>
            </div>
          </div>
        </div>

        <!-- Login/Register -->
        <div class="nav-right" *ngIf="!auth.isLoggedIn()">
          <a routerLink="/auth/login"    class="btn-nav-ghost">Login</a>
          <a routerLink="/auth/register" class="btn-nav-solid">Get Started</a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: rgba(13,27,42,0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(0,180,216,0.15);
      height: 70px;
    }
    .nav-inner {
      max-width: 1280px; margin: 0 auto;
      padding: 0 2rem; height: 100%;
      display: flex; align-items: center; gap: 2rem;
    }
    .nav-brand {
      display: flex; align-items: center; gap: 0.5rem;
      text-decoration: none; flex-shrink: 0;
    }
    .brand-icon { font-size: 1.5rem; }
    .brand-text { font-size: 1.25rem; font-weight: 800; color: #00b4d8; letter-spacing: -0.02em; }
    .nav-links {
      display: flex; align-items: center; gap: 0.25rem; flex: 1;
    }
    .nav-links a {
      padding: 0.5rem 0.875rem; border-radius: 8px;
      color: #94a3b8; text-decoration: none;
      font-size: 0.9rem; font-weight: 500;
      transition: all 0.2s; white-space: nowrap;
    }
    .nav-links a:hover { color: #f0f8ff; background: rgba(255,255,255,0.06); }
    .nav-links a.active { color: #00b4d8; background: rgba(0,180,216,0.1); }
    .nav-right { display: flex; align-items: center; gap: 1rem; margin-left: auto; }
    .plan-badge {
      padding: 0.25rem 0.75rem; border-radius: 100px;
      font-size: 0.75rem; font-weight: 700;
      background: rgba(100,116,139,0.2); color: #94a3b8;
      letter-spacing: 0.04em;
    }
    .plan-badge.premium {
      background: linear-gradient(135deg,rgba(0,180,216,0.2),rgba(99,102,241,0.2));
      color: #00b4d8; border: 1px solid rgba(0,180,216,0.3);
    }
    .btn-upgrade {
      padding: 0.4rem 1rem; border-radius: 8px;
      background: linear-gradient(135deg, #00b4d8, #6366f1);
      color: #fff; text-decoration: none;
      font-size: 0.8125rem; font-weight: 600;
    }
    .btn-nav-ghost {
      padding: 0.5rem 1rem; border-radius: 8px;
      color: #94a3b8; text-decoration: none; font-size: 0.9rem; font-weight: 500;
    }
    .btn-nav-ghost:hover { color: #f0f8ff; }
    .btn-nav-solid {
      padding: 0.5rem 1.25rem; border-radius: 8px;
      background: linear-gradient(135deg, #00b4d8, #6366f1);
      color: #fff; text-decoration: none; font-size: 0.9rem; font-weight: 600;
    }
    .avatar-wrap { position: relative; cursor: pointer; }
    .avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, #00b4d8, #6366f1);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.875rem; color: #fff;
    }
    .dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: #1a2a3d; border: 1px solid rgba(0,180,216,0.2);
      border-radius: 12px; padding: 0.5rem; min-width: 200px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .dropdown-header { padding: 0.5rem 0.75rem; }
    .d-name { font-weight: 600; font-size: 0.9rem; }
    .d-email { color: #94a3b8; font-size: 0.8rem; margin-top: 2px; }
    .dropdown hr { border-color: rgba(0,180,216,0.15); margin: 0.5rem 0; }
    .dropdown button {
      width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px;
      background: none; border: none; color: #ef4444;
      text-align: left; cursor: pointer; font-size: 0.875rem; font-weight: 500;
    }
    .dropdown button:hover { background: rgba(239,68,68,0.1); }
  `],
})
export class NavbarComponent {
  auth = inject(AuthService);
  menuOpen = false;
  isPremium() { return this.auth.currentUser()?.plan === 'premium'; }
  initials() {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }
  toggleMenu() { this.menuOpen = !this.menuOpen; }
}
