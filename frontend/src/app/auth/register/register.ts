import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in-up">
        <div class="auth-logo">🧠</div>
        <h1>Create account</h1>
        <p class="auth-sub">Join BipolarGuide — free to start</p>

        <form (ngSubmit)="submit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">Full name</label>
            <input id="reg-name" class="form-control" type="text"
                   [(ngModel)]="name" name="name" placeholder="Your name" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email address</label>
            <input id="reg-email" class="form-control" type="email"
                   [(ngModel)]="email" name="email" placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input id="reg-password" class="form-control" type="password"
                   [(ngModel)]="password" name="password" placeholder="Min. 8 characters" minlength="8" required />
          </div>
          <div class="form-group">
            <label class="form-label">I am a…</label>
            <select id="reg-role" class="form-control" [(ngModel)]="role" name="role">
              <option value="patient">Patient (self-assessment)</option>
              <option value="professional">Mental Health Professional</option>
            </select>
          </div>
          <button id="reg-submit" class="btn btn-primary btn-lg" type="submit"
                  style="width:100%;justify-content:center" [disabled]="loading">
            {{ loading ? 'Creating account…' : 'Create Free Account' }}
          </button>
        </form>

        <p class="auth-footer">
          Already have an account?
          <a routerLink="/auth/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: calc(100vh - 70px); display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .auth-card { background: rgba(22,32,50,0.8); border: 1px solid rgba(0,180,216,0.2); border-radius: 24px; padding: 3rem; width: 100%; max-width: 440px; backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(0,0,0,0.5); text-align: center; }
    .auth-logo { font-size: 3rem; margin-bottom: 1rem; }
    h1 { margin-bottom: 0.5rem; }
    .auth-sub { color: #94a3b8; margin-bottom: 2rem; }
    .auth-form { text-align: left; margin-bottom: 1.5rem; }
    .auth-footer { color: #64748b; font-size: 0.9rem; }
    .auth-footer a { color: #00b4d8; text-decoration: none; font-weight: 500; }
  `],
})
export class RegisterComponent {
  name = ''; email = ''; password = ''; role = 'patient'; loading = false;
  auth = inject(AuthService);
  notif = inject(NotificationService);

  submit() {
    if (!this.name || !this.email || !this.password) return;
    this.loading = true;
    this.auth.register({ name: this.name, email: this.email, password: this.password, role: this.role }).subscribe({
      next: () => { this.notif.success('Account created!'); this.auth.redirectToDashboard(); },
      error: (e) => { 
        let errorMsg = 'Registration failed';
        if (e.status === 422 && Array.isArray(e.error?.detail)) {
          errorMsg = e.error.detail.map((err: any) => \`\${err.loc.join('.')} : \${err.msg}\`).join(', ');
        } else if (e.error?.detail) {
          errorMsg = typeof e.error.detail === 'string' ? e.error.detail : JSON.stringify(e.error.detail);
        }
        this.notif.error(errorMsg); 
        this.loading = false; 
      },
    });
  }
}
