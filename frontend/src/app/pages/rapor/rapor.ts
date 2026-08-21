import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { JobApi, AsamaSuresi } from '../../services/job-api';
import { buyuklukAdi } from '../../etiketler';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { AyarService } from '../../services/ayar';
import { JobStore } from '../../services/job-store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-rapor',
  imports: [DatePipe, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './rapor.html',
  styleUrl: './rapor.scss',
})
export class Rapor implements OnInit {
  private store = inject(JobStore);
  private jobApi = inject(JobApi);
  jobs = this.store.isler;
  private ayar = inject(AyarService);

  private gunMs = 1000 * 60 * 60 * 24;
  protected yukDurumu = this.store.durum;
  protected yukHatasi = this.store.hata;

  tekrarDene() { this.store.yenile(); }
  tamamlananlar = computed(() => this.jobs().filter(j => j.status === 'Tamamlandi'));

  tamamlananSayi = computed(() => this.tamamlananlar().length);

  ortalamaDonguSuresi = computed(() => {
    const bitenler = this.tamamlananlar().filter(j => j.completedAt);
    if (bitenler.length === 0) return 0;
    const toplamGun = bitenler.reduce((t, j) => {
      const fark = new Date(j.completedAt!).getTime() - new Date(j.createdAt).getTime();
      return t + fark / this.gunMs;
    }, 0);
    return Math.round(toplamGun / bitenler.length);
  });

  zamanindaTeslimOrani = computed(() => {
    const bitenler = this.tamamlananlar().filter(j => j.completedAt);
    if (bitenler.length === 0) return 0;
    const zamaninda = bitenler.filter(j =>
      new Date(j.completedAt!).getTime() <= new Date(j.deadline).getTime()
    ).length;
    return Math.round((zamaninda / bitenler.length) * 100);
  });
  protected buyuklukAdi = buyuklukAdi;

  teslimGecmisi = computed(() =>
    [...this.tamamlananlar()]
      .filter(j => j.completedAt)
      .sort((a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
      )
      .map(j => {
        const dongu = Math.round(
          (new Date(j.completedAt!).getTime() - new Date(j.createdAt).getTime()) / this.gunMs
        );
        const zamaninda = new Date(j.completedAt!).getTime() <= new Date(j.deadline).getTime();
        return { ...j, dongu, zamaninda };
      })
  );
  buyuklukSirasi = ['FastTrack', 'XS', 'S', 'M', 'L', 'XL'];

  buyuklukSureleri = computed(() =>
    this.buyuklukSirasi.map(kod => {
      const isler = this.tamamlananlar().filter(j => j.buyukluk === kod && j.completedAt);
      const adet = isler.length;
      const ortalama = adet === 0 ? 0 : Math.round(
        isler.reduce((t, j) =>
          t + (new Date(j.completedAt!).getTime() - new Date(j.createdAt).getTime()) / this.gunMs, 0
        ) / adet
      );
      const hedef = this.ayar.hedefSureler()[kod] ?? 0;
      return {
        kod,
        etiket: buyuklukAdi(kod),
        adet,
        ortalama,
        hedef,
        gecikme: adet > 0 && ortalama > hedef,
      };
    })
  );

  asamaSureleri = signal<AsamaSuresi[]>([]);

  asamaCubuklari = computed(() => {
    const veri = this.asamaSureleri();
    const enBuyuk = Math.max(...veri.map(a => a.ortalamaGun), 1);
    return veri.map(a => ({
      ...a,
      yuzde: (a.ortalamaGun / enBuyuk) * 100,
      darbogaz: a.ortalamaGun === enBuyuk && a.ortalamaGun > 0,
    }));
  });

  ngOnInit() {
    this.yukle();
  }

  yukle() {
    this.store.yukle();

    this.jobApi.getAsamaSureleri().subscribe({
      next: (veri) => this.asamaSureleri.set(veri),
      error: (err) => console.error('Aşama süreleri alınamadı:', err),
    });
  }
}