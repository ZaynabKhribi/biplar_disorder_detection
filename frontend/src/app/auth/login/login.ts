import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in-up">
        <div class="auth-logo">🧠</div>
        <h1>Welcome back</h1>
        <p class="auth-sub">Sign in to your BipolarGuide account</p>

        <form (ngSubmit)="submit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">Email address</label>
            <input id="login-email" class="form-control" type="email"
                   [(ngModel)]="email" name="email"
                   placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input id="login-password" class="form-control" type="password"
                   [(ngModel)]="password" name="password"
                   placeholder="••••••••" required />
          </div>
          <button id="login-submit" class="btn btn-primary btn-lg" type="submit"
                  style="width:100%;justify-content:center" [disabled]="loading">
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <!-- Demo credentials hint -->
        <div class="demo-hint">
          <p><strong>Demo credentials:</strong></p>
          <p>Free Patient: patient_free1&#64;bipolarguide.com / Patient123!</p>
          <p>Premium: patient_premium1&#64;bipolarguide.com / Patient123!</p>
          <p>Professional: pro1&#64;bipolarguide.com / Pro123!</p>
          <p>Admin: admin&#64;bipolarguide.com / Admin123!</p>
        </div>

        <p class="auth-footer">
          Don't have an account?
          <a routerLink="/auth/register">Create one</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 70px);
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
    }
    .auth-card {
      background: rgba(22,32,50,0.8);
      border: 1px solid rgba(0,180,216,0.2);
      border-radius: 24px; padding: 3rem;
      width: 100%; max-width: 440px;
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      text-align: center;
    }
    .auth-logo { font-size: 3rem; margin-bottom: 1rem; }
    h1 { margin-bottom: 0.5rem; }
    .auth-sub { color: #94a3b8; margin-bottom: 2rem; }
    .auth-form { text-align: left; margin-bottom: 1.5rem; }
    .demo-hint {
      background: rgba(0,180,216,0.06); border: 1px solid rgba(0,180,216,0.15);
      border-radius: 12px; padding: 1rem; text-align: left;
      font-size: 0.8rem; color: #94a3b8; margin-bottom: 1.5rem;
    }
    .demo-hint strong { color: #00b4d8; }
    .demo-hint p { margin-bottom: 0.25rem; }
    .auth-footer { color: #64748b; font-size: 0.9rem; }
    .auth-footer a { color: #00b4d8; text-decoration: none; font-weight: 500; }
  `],
})
export class LoginComponent {
  email = ''; password = ''; loading = false;
  auth = inject(AuthService);
  notif = inject(NotificationService);

  submit() {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.notif.success('Welcome back!'); this.auth.redirectToDashboard(); },
      error: (e) => { this.notif.error(e.error?.detail ?? 'Login failed'); this.loading = false; },
    });
  }
}
