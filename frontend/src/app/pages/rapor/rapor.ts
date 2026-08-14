import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { JobApi, Job, AsamaSuresi } from '../../services/job-api';
import { buyuklukAdi } from '../../etiketler';

import { DatePipe } from '@angular/common';
import { AyarService } from '../../services/ayar';
import { JobStore } from '../../services/job-store';
@Component({
  selector: 'app-rapor',
  imports: [DatePipe],
  templateUrl: './rapor.html',
  styleUrl: './rapor.scss',
})
export class Rapor implements OnInit {
  private store = inject(JobStore);
  private jobApi = inject(JobApi);
  jobs = this.store.isler;
  private ayar = inject(AyarService);

  private gunMs = 1000 * 60 * 60 * 24;

  // Birçok metriğin ortak temeli: tamamlanmış işler
  tamamlananlar = computed(() => this.jobs().filter(j => j.status === 'Tamamlandi'));

  // 1) Tamamlanan iş sayısı
  tamamlananSayi = computed(() => this.tamamlananlar().length);

  // 2) Ortalama döngü süresi (gün) = tamamlanma − oluşturulma
  ortalamaDonguSuresi = computed(() => {
    const bitenler = this.tamamlananlar().filter(j => j.completedAt);
    if (bitenler.length === 0) return 0;
    const toplamGun = bitenler.reduce((t, j) => {
      const fark = new Date(j.completedAt!).getTime() - new Date(j.createdAt).getTime();
      return t + fark / this.gunMs;
    }, 0);
    return Math.round(toplamGun / bitenler.length);
  });

  // 3) Zamanında teslim oranı (%) = termininden önce bitenler / tüm bitenler
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
    [...this.tamamlananlar()]                       // KOPYA — signal dizisini yerinde sıralama!
      .filter(j => j.completedAt)
      .sort((a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()  // yeniden → eskiye
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
        gecikme: adet > 0 && ortalama > hedef,   // hedefi aşınca kırmızı
      };
    })
  );

  asamaSureleri = signal<AsamaSuresi[]>([]);

  asamaCubuklari = computed(() => {
    const veri = this.asamaSureleri();
    const enBuyuk = Math.max(...veri.map(a => a.ortalamaGun), 1);   // en uzun çubuk = %100
    return veri.map(a => ({
      ...a,
      yuzde: (a.ortalamaGun / enBuyuk) * 100,
      darbogaz: a.ortalamaGun === enBuyuk && a.ortalamaGun > 0,      // en yavaş aşama
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