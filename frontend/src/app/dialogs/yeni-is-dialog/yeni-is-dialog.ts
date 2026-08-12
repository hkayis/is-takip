import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { JobDetail } from '../../services/job-api';
import { MatSelectModule } from '@angular/material/select';
import { hesaplananBuyukluk } from '../../etiketler';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { AyarService } from '../../services/ayar';
@Component({
  selector: 'app-yeni-is-dialog',
  imports: [FormsModule, MatSelectModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatDatepickerModule],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'tr-TR' },   // takvim Türkçe, gg.aa.yyyy
  ],
  templateUrl: './yeni-is-dialog.html',
  styleUrl: './yeni-is-dialog.scss',
})
export class YeniIsDialog {
  private dialogRef = inject(MatDialogRef<YeniIsDialog>);
  private data = inject<JobDetail | null>(MAT_DIALOG_DATA);
  private ayar = inject(AyarService);

  
  duzenleme = this.data !== null;

  isNo: number | null = this.data?.id ?? null;
  baslik = this.data?.title ?? '';
  aciklama = this.data?.description ?? '';
  tarih: Date | null = this.data ? new Date(this.data.deadline) : null;
  adam: number | null = this.data?.adam ?? null;
  gun: number | null = this.data?.gun ?? null;
  buyukluk = this.data?.buyukluk ?? hesaplananBuyukluk(this.adam ?? 0, this.gun ?? 0);
  oncelik = this.data?.priority ?? "Normal";
  hata = '';

  /** Kullanıcı büyüklüğü elle seçtiyse artık otomatik önerme. */
  buyuklukElleSecildi = false;

  /** Adam veya gün değişince öneriyi tazele. */
  eforDegisti() {
    if (!this.buyuklukElleSecildi && this.adam && this.gun) {
      this.buyukluk = hesaplananBuyukluk(this.adam, this.gun, this.ayar.buyuklukEsikleri());
    }
  }

  /** Seçili büyüklük, adam-günden önerilenden farklıysa öneriyi döndürür. */
  get onerilenBuyukluk(): string | null {
    if (!this.adam || !this.gun) return null;
    const oneri =hesaplananBuyukluk(this.adam, this.gun, this.ayar.buyuklukEsikleri());
    return oneri !== this.buyukluk ? oneri : null;
  }

  get adamGun(): number | null {
    return this.adam && this.gun ? this.adam * this.gun : null;
  }
  /** Date → "YYYY-MM-DD" (yerel tarih, saat dilimi kaymadan). */
  private tarihMetni(d: Date): string {
    const ay = String(d.getMonth() + 1).padStart(2, '0');
    const gun = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${ay}-${gun}`;
  }
  kaydet() {
    if (!this.isNo || !this.baslik.trim() || !this.tarih) {
      this.hata = 'İş numarası, başlık ve son tarih zorunludur.';
      return;
    }

    if (!this.adam || !this.gun) {
      this.hata = 'Adam ve gün alanları zorunludur.';
      return;
    }

    this.dialogRef.close({
      id: this.isNo,
      title: this.baslik,
      description: this.aciklama,
      deadline: this.tarihMetni(this.tarih!),
      priority: this.oncelik,
      adam: this.adam,
      gun: this.gun,
      buyukluk: this.buyukluk,

    });
  }

  iptal() {
    this.dialogRef.close();
  }
}