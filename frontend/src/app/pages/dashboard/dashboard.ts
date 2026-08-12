import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { JobApi, Job } from '../../services/job-api';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { YeniIsDialog } from '../../dialogs/yeni-is-dialog/yeni-is-dialog';
import { oncelikAdi, buyuklukAdi } from '../../etiketler';
import { MatButtonModule } from '@angular/material/button';
import { AyarService } from '../../services/ayar';
@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, DatePipe, MatDialogModule, MatSnackBarModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  protected oncelikAdi = oncelikAdi;
  private jobApi = inject(JobApi);
  private dialog = inject(MatDialog);
  private ayar = inject(AyarService);
  private snackBar = inject(MatSnackBar);
  jobs = signal<Job[]>([]);


  private router = inject(Router);
  asamaSirasi: string[] = ['Analiz', 'Gelistirme', 'Test', 'Tasima']
  buyuklukSirasi: string[] = ['FastTrack', 'XS', 'S', 'M', 'L', 'XL'];

  // UI durumu: hangi kapsamı görüyoruz?
  buyuklukKapsam = signal<'Beklemede' | 'DevamEdiyor'>('DevamEdiyor');
  buyuklukKapsamSec(kapsam: 'Beklemede' | 'DevamEdiyor') {
    this.buyuklukKapsam.set(kapsam);
  }

  buyuklukDagilimi = computed(() => {
    const kapsam = this.buyuklukKapsam();                         // ← signal'ı oku (bağımlılık)
    const isler = this.jobs().filter(j => j.status === kapsam);

    const ham = this.buyuklukSirasi.map(b => ({
      kod: b,
      etiket: buyuklukAdi(b),
      sayi: isler.filter(j => j.buyukluk === b).length,
    }));

    const enBuyuk = Math.max(...ham.map(x => x.sayi), 1);
    return ham.map(x => ({ ...x, yuzde: (x.sayi / enBuyuk) * 100 }));
  });

  /** Yazdırma için: iki kapsam da, ORTAK ölçekle. */
  buyuklukIkisi = computed(() => {
    const say = (kapsam: string, kod: string) =>
      this.jobs().filter(j => j.status === kapsam && j.buyukluk === kod).length;

    const gruplar = [
      { baslik: 'Devam Edenler', kapsam: 'DevamEdiyor' },
      { baslik: 'Beklemede', kapsam: 'Beklemede' },
    ].map(g => ({
      baslik: g.baslik,
      satirlar: this.buyuklukSirasi.map(kod => ({
        kod,
        etiket: buyuklukAdi(kod),
        sayi: say(g.kapsam, kod),
      })),
    }));

    // İki grubun ortak en büyüğü — çubuklar birbiriyle kıyaslanabilir olsun
    const enBuyuk = Math.max(...gruplar.flatMap(g => g.satirlar.map(s => s.sayi)), 1);

    return gruplar.map(g => ({
      ...g,
      satirlar: g.satirlar.map(s => ({ ...s, yuzde: (s.sayi / enBuyuk) * 100 })),
    }));
  });
  oncelikPuani: Record<string, number> = {
    Dusuk: 1,
    Normal: 2,
    Yuksek: 3,
    Acil: 4,
  };


  listeyeGit(durum?: string) {
    this.router.navigate(['/jobs'], { queryParams: durum ? { durum } : {} });
  }
  oncelikListesiniAc(oncelik: string) {
    this.router.navigate(['/jobs'], { queryParams: { oncelik } });
  }
  isiAc(id: number) {
    this.router.navigate(['/jobs'], { queryParams: { sec: id } });
  }


  buAyTamamlanan = computed(() => {
    const simdi = new Date();
    const ay = simdi.getMonth();
    const yil = simdi.getFullYear();

    return this.jobs().filter(j => {
      if (!j.completedAt) return false;
      const bitis = new Date(j.completedAt);
      return bitis.getMonth() === ay && bitis.getFullYear() === yil;
    }).length;
  });
  ortalamaSure = computed(() => {
    const gunMs = 1000 * 60 * 60 * 24;
    const bitenler = this.jobs().filter(j => j.completedAt !== null);

    if (bitenler.length === 0) return 0;

    const toplamGun = bitenler.reduce((toplam, j) => {
      const sure = new Date(j.completedAt!).getTime() - new Date(j.createdAt).getTime();
      return toplam + sure / gunMs;
    }, 0);

    return Math.round(toplamGun / bitenler.length);
  });

  toplam = computed(() => this.jobs().length);
  bekleyen = computed(() => this.jobs().filter(j => j.status === 'Beklemede').length);
  devamEden = computed(() => this.jobs().filter(j => j.status === 'DevamEdiyor').length);
  tamamlanan = computed(() => this.jobs().filter(j => j.status === 'Tamamlandi').length);
  iptal = computed(() => this.jobs().filter(j => j.status === 'Iptal').length);

  aktifEfor = computed(() =>
    this.jobs()
      .filter(j => j.status === 'DevamEdiyor')
      .reduce((toplam, j) => toplam + (j.adam ?? 0) * (j.gun ?? 0), 0)
  );

  durumDagilimi = computed(() => {
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

  toplamEfor = computed(() =>
    this.jobs().reduce((t, j) => t + (j.adam ?? 0) * (j.gun ?? 0), 0)
  );

  geciken = computed(() => {
    const simdi = new Date();
    return this.jobs().filter(j =>
      j.status !== 'Tamamlandi' &&
      j.status !== 'Iptal' &&
      new Date(j.deadline) < simdi
    );
  });





  oncelikDagilimi = computed(() => {
    const say = (p: string) => this.jobs().filter(j => j.priority === p && (j.status === 'DevamEdiyor')).length

    const ham = [
      { oncelik: 'Dusuk', etiket: 'Düşük', sayi: say('Dusuk') },
      { oncelik: 'Normal', etiket: 'Normal', sayi: say('Normal') },
      { oncelik: 'Yuksek', etiket: 'Yuksek', sayi: say('Yuksek') },
      { oncelik: 'Acil', etiket: 'Acil', sayi: say('Acil') },
    ];
    const enBuyuk = Math.max(...ham.map(x => x.sayi), 1);
    return ham.map(x => ({ ...x, yuzde: (x.sayi / enBuyuk) * 100 }));
  })

  dikkatGerekenler = computed(() => {
    const simdi = Date.now();
    const gunMs = 1000 * 60 * 60 * 24;
    const sinir = simdi + this.ayar.dikkatPenceresiGun() * gunMs;

    return this.jobs()
      .filter(j => {
        if (j.status === 'Tamamlandi' || j.status === 'Iptal') return false;
        return new Date(j.deadline).getTime() <= sinir;
      })
      .map(j => {
        const fark = Math.ceil((new Date(j.deadline).getTime() - simdi) / gunMs);
        const aciliyet = 10 - fark;
        const skor = (this.oncelikPuani[j.priority] ?? 1) * aciliyet;

        return {
          ...j,
          fark,
          skor,
          gecikti: fark < 0,
          etiket: fark < 0
            ? `${Math.abs(fark)} gün gecikti`
            : fark === 0
              ? 'bugün'
              : `${fark} gün kaldı`,
        };
      })
      .sort((a, b) => b.skor - a.skor);
  });


  asamaDagilimi = computed(() => {
    const devam = this.jobs().filter(j => j.status === 'DevamEdiyor');
    const ham = this.asamaSirasi.map(a => ({
      asama: a,
      sayi: devam.filter(j => j.stage === a).length,
    }));
    const enBuyuk = Math.max(...ham.map(x => x.sayi), 1);
    return ham.map(x => ({ ...x, yuzde: (x.sayi / enBuyuk) * 100 }))
  });


  bugun = new Date();

  yazdir() {
    window.print();
  }

  ngOnInit() {
    this.yukle();
  }

  yukle() {
    this.jobApi.getAll().subscribe({
      next: (liste) => this.jobs.set(liste),
      error: (err) => console.error('İşler alınamadı:', err),
    });
  }

  yeniIsAc() {
    const ref = this.dialog.open(YeniIsDialog, { width: '420px' });
    ref.afterClosed().subscribe((sonuc) => {
      if (!sonuc) return;
      this.jobApi.create(sonuc).subscribe({
        next: () => this.yukle(),
        error: (err) => {
          const mesaj = err.status === 409
            ? err.error?.message ?? 'Bu iş numarası zaten kullanılıyor.'
            : 'İş oluşturulamadı.';
          this.snackBar.open(mesaj, 'Tamam', { duration: 4000 });
        },
      });
    });
  }
}