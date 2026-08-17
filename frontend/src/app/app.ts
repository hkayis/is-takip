import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive,Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from './services/auth';
import { AyarService } from './services/ayar';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, 
    MatToolbarModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private ayar= inject(AyarService)
  protected readonly title = signal('İş Akışı');
  protected auth = inject(Auth);
  private router = inject(Router);

  cikisYap() {
    this.auth.cikis();
    this.router.navigate(['/login']);
  }
}