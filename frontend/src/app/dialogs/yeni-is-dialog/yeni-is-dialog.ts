import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { JobDetail } from '../../services/job-api';
import { MatSelectModule } from '@angular/material/select';
import { hesaplananBuyukluk } from '../../etiketler';
@Component({
  selector: 'app-yeni-is-dialog',
  imports: [FormsModule, MatSelectModule ,MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './yeni-is-dialog.html',
  styleUrl: './yeni-is-dialog.scss',
})
export class YeniIsDialog {
  private dialogRef = inject(MatDialogRef<YeniIsDialog>);
  private data = inject<JobDetail | null>(MAT_DIALOG_DATA);

  duzenleme = this.data !== null;

  isNo: number | null = this.data?.id ?? null;
  baslik = this.data?.title ?? '';
  aciklama = this.data?.description ?? '';
  tarih = this.data?.deadline.substring(0, 10) ?? '';
  adam: number | null = this.data?.adam ?? null;
  gun: number | null = this.data?.gun ?? null;
  buyukluk = this.data?.buyukluk ?? hesaplananBuyukluk(this.adam ?? 0, this.gun ?? 0);
  oncelik=this.data?.priority ?? "Normal";
  not: string|null =this.data?.not ?? null;
  hata='';

  /** Kullanıcı büyüklüğü elle seçtiyse artık otomatik önerme. */
  buyuklukElleSecildi = false;

  /** Adam veya gün değişince öneriyi tazele. */
  eforDegisti() {
    if (!this.buyuklukElleSecildi && this.adam && this.gun) {
      this.buyukluk = hesaplananBuyukluk(this.adam, this.gun);
    }
  }

  /** Seçili büyüklük, adam-günden önerilenden farklıysa öneriyi döndürür. */
  get onerilenBuyukluk(): string | null {
    if (!this.adam || !this.gun) return null;
    const oneri = hesaplananBuyukluk(this.adam, this.gun);
    return oneri !== this.buyukluk ? oneri : null;
  }

  get adamGun(): number | null {
    return this.adam && this.gun ? this.adam * this.gun : null;
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
      deadline: this.tarih,
      priority: this.oncelik,
      adam: this.adam,
      gun: this.gun,
      buyukluk: this.buyukluk
    });
  }

  iptal() {
    this.dialogRef.close();
  }
}