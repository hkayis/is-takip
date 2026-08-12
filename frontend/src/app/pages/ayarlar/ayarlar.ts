import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AyarService } from '../../services/ayar';
import { buyuklukAdi } from '../../etiketler';

@Component({
  selector: 'app-ayarlar',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './ayarlar.html',
  styleUrl: './ayarlar.scss',
})
export class Ayarlar {
  private ayar = inject(AyarService);
  private snackBar = inject(MatSnackBar);

  protected buyuklukAdi = buyuklukAdi;
  buyuklukSirasi = ['FastTrack', 'XS', 'S', 'M', 'L', 'XL'];

  // Düzenleme taslağı — Kaydet'e basılana kadar gerçek ayarlara dokunmaz
  esikler: Record<string, number>;
  hedefler: Record<string, number>;
  dikkatGun: number;
  hata = '';

  constructor() {
    this.esikler = { ...this.ayar.buyuklukEsikleri() };   // KOPYA (bkz. not)
    this.hedefler = { ...this.ayar.hedefSureler() };
    this.dikkatGun = this.ayar.dikkatPenceresiGun();
  }

  kaydet() {
    this.hata = '';

    // Eşikler artan sırada olmalı, yoksa hesaplananBuyukluk saçmalar
    for (let i = 1; i < this.buyuklukSirasi.length; i++) {
      const oncekiKod = this.buyuklukSirasi[i - 1];
      const kod = this.buyuklukSirasi[i];
      if (this.esikler[kod] <= this.esikler[oncekiKod]) {
        this.hata = `${buyuklukAdi(kod)} eşiği, ${buyuklukAdi(oncekiKod)} eşiğinden büyük olmalı.`;
        return;
      }
    }

    if (this.dikkatGun < 1) {
      this.hata = 'Dikkat penceresi en az 1 gün olmalı.';
      return;
    }

    this.ayar.kaydet({
      buyuklukEsikleri: this.esikler,
      hedefSureler: this.hedefler,
      dikkatPenceresiGun: this.dikkatGun,
    });
    this.snackBar.open('Ayarlar kaydedildi.', 'Tamam', { duration: 3000 });
  }

  sifirla() {
    this.ayar.sifirla();
    this.esikler = { ...this.ayar.buyuklukEsikleri() };
    this.hedefler = { ...this.ayar.hedefSureler() };
    this.dikkatGun = this.ayar.dikkatPenceresiGun();
    this.hata = '';
    this.snackBar.open('Varsayılanlara dönüldü.', 'Tamam', { duration: 3000 });
  }
}