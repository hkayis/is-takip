import { Component, inject, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { YeniIsDialog } from '../../dialogs/yeni-is-dialog/yeni-is-dialog';
import { JobStore } from '../../services/job-store';
import { DikkatKarti } from '../../components/dikkat-karti/dikkat-karti';
import { OncelikKarti } from '../../components/oncelik-karti/oncelik-karti';
import { BuyuklukKarti } from '../../components/buyukluk-karti/buyukluk-karti';
import { AsamaKarti } from '../../components/asama-karti/asama-karti';
import { AylikKarti } from '../../components/aylik-karti/aylik-karti';
import { TeslimKarti } from '../../components/teslim-karti/teslim-karti';
import { AyarService } from '../../services/ayar';
import { SlotMenu } from '../../components/slot-menu/slot-menu';
@Component({
  selector: 'app-dashboard',
  imports: [
    TeslimKarti,
    AylikKarti,
    DikkatKarti,
    OncelikKarti,
    BuyuklukKarti,
    AsamaKarti,
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    SlotMenu
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private store = inject(JobStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private ayar = inject(AyarService);

  protected slotlar = this.ayar.panoSlotlari;
  jobs = this.store.isler;
  protected yukDurumu = this.store.durum;
  protected yukHatasi = this.store.hata;
  protected bugun = new Date();

  protected toplam = computed(() => this.jobs().length);

  private bekleyen = computed(() => this.jobs().filter(j => j.status === 'Beklemede').length);
  private devamEden = computed(() => this.jobs().filter(j => j.status === 'DevamEdiyor').length);
  private tamamlanan = computed(() => this.jobs().filter(j => j.status === 'Tamamlandi').length);
  private iptal = computed(() => this.jobs().filter(j => j.status === 'Iptal').length);

  protected toplamEfor = computed(() =>
    this.jobs().reduce((t, j) => t + (j.adam ?? 0) * (j.gun ?? 0), 0)
  );

  protected durumDagilimi = computed(() => {
    const toplam = this.toplam();
    const efor = (durum: string) =>
      this.jobs()
        .filter(j => j.status === durum)
        .reduce((t, j) => t + (j.adam ?? 0) * (j.gun ?? 0), 0);

    const ham = [
      { durum: 'Beklemede', etiket: 'Bekleyen', sayi: this.bekleyen(), efor: efor('Beklemede') },
      { durum: 'DevamEdiyor', etiket: 'Devam Eden', sayi: this.devamEden(), efor: efor('DevamEdiyor') },
      { durum: 'Tamamlandi', etiket: 'Tamamlanan', sayi: this.tamamlanan(), efor: efor('Tamamlandi') },
      { durum: 'Iptal', etiket: 'İptal', sayi: this.iptal(), efor: efor('Iptal') },
    ];

    return ham.map(x => ({ ...x, yuzde: toplam ? (x.sayi / toplam) * 100 : 0 }));
  });

  ngOnInit() {
    this.yukle();
  }

  protected yukle() {
    this.store.yukle();
  }

  protected tekrarDene() {
    this.store.yenile();
  }

  protected listeyeGit(durum?: string) {
    this.router.navigate(['/jobs'], { queryParams: durum ? { durum } : {} });
  }

  protected yazdir() {
    window.print();
  }

  protected yeniIsAc() {
    const ref = this.dialog.open(YeniIsDialog, { width: '420px' });
    ref.afterClosed().subscribe(sonuc => {
      if (!sonuc) return;
      this.store.olustur(sonuc).subscribe({
        error: err => {
          const mesaj = err.status === 409
            ? err.error?.message ?? 'Bu iş numarası zaten kullanılıyor.'
            : 'İş oluşturulamadı.';
          this.snackBar.open(mesaj, 'Tamam', { duration: 4000 });
        },
      });
    });
  }
}
