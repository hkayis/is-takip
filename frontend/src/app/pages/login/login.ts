import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);
  username = '';
  password = '';
  hata = '';

  girisYap() {
    this.auth.login(this.username, this.password).subscribe({
      next: (cevap) => {
        this.auth.tokenKaydet(cevap.token);
        this.router.navigate(['/dashboard'])
        this.hata = '';
      },
      error: (err) => {
        console.error('Giriş hatası:', err);
        this.hata = 'Kullanıcı adı veya şifre hatalı';
      },
    });
  }
}