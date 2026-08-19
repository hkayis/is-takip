import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { UYGULAMA_ADI } from '../../sabitler';
@Component({
  selector: 'app-login',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);
  public title=UYGULAMA_ADI;
  username = '';
  password = '';
  hata = '';
  yukleniyor = false;
  sifreGorunur = false;

  girisYap() {
    if (this.yukleniyor) return;        // çift gönderimi engelle
    this.hata = '';
    this.yukleniyor = true;

    this.auth.login(this.username, this.password).subscribe({
      next: (cevap) => {
        this.auth.tokenKaydet(cevap.token);
        
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.yukleniyor = false;
        this.hata = err.status === 429
          ? (err.error?.message ?? 'Çok fazla deneme yapıldı. Lütfen biraz bekleyin.')
          : 'Kullanıcı adı veya şifre hatalı';
      },
    });
  }
}