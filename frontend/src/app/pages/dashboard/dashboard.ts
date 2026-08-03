import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { JobApi, Job } from '../../services/job-api';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { YeniIsDialog } from '../../dialogs/yeni-is-dialog/yeni-is-dialog';
import { oncelikAdi } from '../../etiketler';
@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, DatePipe, MatDialogModule, MatSnackBarModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  protected oncelikAdi = oncelikAdi;
  private jobApi = inject(JobApi);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  jobs = signal<Job[]>([]);
 
  
  private router =inject(Router);
  asamaSirasi : string[] = ['Plan', 'Design','Develop' ,'Test', 'Deploy', 'Review']
  oncelikPuani: Record <string, number> = {
    Dusuk: 1,
    Normal: 2,
    Yuksek: 3,
    Acil: 4,
  };
  seciliDurum= signal<string | null>(null);
  secDurum(durum: string){
    this.seciliDurum.set(this.seciliDurum()===durum ? null : durum);
  }
  listeyeGit(durum:string){
    this.router.navigate(['/jobs'], {queryParams: {durum}});
  }
    oncelikListesiniAc(oncelik: string) {
    this.router.navigate(['/jobs'], { queryParams: { oncelik } });
  }
    isiAc(id: number) {
    this.router.navigate(['/jobs'], { queryParams: { sec: id } });
  }

  seciliOzet = computed(()=> {
    const durum = this.seciliDurum();
    if (!durum) return null;
    
    const isler = this.jobs().filter(j=> j.status === durum);
    const toplam = this.toplam();
    const simdi = new Date();

    const asamalar = durum === 'DevamEdiyor'
      ? this.asamaSirasi
        .map(a=> ({asama : a, sayi: isler.filter(j=> j.stage===a).length}))
        .filter( x=> x.sayi > 0)
      : [];
    
    return{
      sayi: isler.length,
      yuzde: toplam ? Math.round((isler.length / toplam )* 100): 0,
      efor: isler.reduce((t, j) => t + (j.adam ?? 0) * (j.gun ?? 0), 0),
      geciken: (durum === 'Tamamlandi' || durum ==='Iptal')
       ? 0
       : isler.filter(j=> new Date(j.deadline)<simdi).length,
       asamalar,
    };
  })
  buAyTamamlanan = computed (()=> {
    const simdi= new Date();
    const ay=simdi.getMonth();
    const yil=simdi.getFullYear();

    return this.jobs().filter(j=> {
      if(!j.completedAt) return false;
      const bitis = new Date(j.completedAt);
      return bitis.getMonth() === ay && bitis.getFullYear()===yil;
    }).length;
  });
  ortalamaSure = computed (()=>{
    const gunMs = 1000 * 60 * 60 * 24;
    const bitenler = this.jobs().filter(j=> j.completedAt !==null);

    if(bitenler.length === 0) return 0;

    const toplamGun = bitenler.reduce((toplam, j)=> {
      const sure = new Date(j.completedAt!).getTime() - new Date(j.createdAt).getTime();
      return toplam + sure /gunMs;
    }, 0);

    return Math.round(toplamGun/bitenler.length);
  });

  toplam = computed(() => this.jobs().length);
  bekleyen = computed(() => this.jobs().filter(j => j.status === 'Beklemede').length);
  devamEden = computed(() => this.jobs().filter(j => j.status === 'DevamEdiyor').length);
  tamamlanan = computed(() => this.jobs().filter(j => j.status === 'Tamamlandi').length);
  iptal = computed(() => this.jobs().filter(j => j.status === 'Iptal').length);

  aktifEfor= computed(()=> 
    this.jobs()
      .filter(j=> j.status === 'Beklemede' || j.status === 'DevamEdiyor')
      .reduce((toplam, j) => toplam + (j.adam ?? 0) * (j.gun ?? 0), 0)
  );
  
  durumDagilimi = computed(() => {
    const toplam = this.toplam();

    const ham = [
      { durum: 'Beklemede',   etiket: 'Bekleyen',   sayi: this.bekleyen() },
      { durum: 'DevamEdiyor', etiket: 'Devam Eden', sayi: this.devamEden() },
      { durum: 'Tamamlandi',  etiket: 'Tamamlanan', sayi: this.tamamlanan() },
      { durum: 'Iptal',       etiket: 'İptal',      sayi: this.iptal() },
    ];

    return ham.map(x => ({
      ...x,
      yuzde: toplam ? (x.sayi / toplam) * 100 : 0,
    }));
  });

  geciken = computed(() => {
    const simdi = new Date();
    return this.jobs().filter(j =>
      j.status !== 'Tamamlandi' &&
      j.status !== 'Iptal' &&
      new Date(j.deadline) < simdi
    );
  });

  gecikenler= computed(()=> {
    const simdi = Date.now();
    const gunMs= 1000 * 60 * 60 * 24;

    return this.jobs()
    .filter(j=>
      j.status !== 'Tamamlandi' &&
      j.status !== 'Iptal' &&
      new Date(j.deadline).getTime()<simdi
    )
    .map(j=> ({
      ...j,
      gecikmeGun:Math.floor((simdi-new Date(j.deadline).getTime())/gunMs),
    }))
    .sort((a,b)=> b.gecikmeGun -a.gecikmeGun);
  })

    yaklasanlar = computed(() => {
    const simdi = Date.now();
    const gunMs = 1000 * 60 * 60 * 24;
    const sinir = simdi + 7 * gunMs;

    return this.jobs()
      .filter(j => {
        if (j.status === 'Tamamlandi' || j.status === 'Iptal') return false;
        const son = new Date(j.deadline).getTime();
        return son >= simdi && son <= sinir;
      })
      .map(j => ({
        ...j,
        kalanGun: Math.ceil((new Date(j.deadline).getTime() - simdi) / gunMs),
      }))
      .sort((a, b) => a.kalanGun - b.kalanGun);
  });

  oncelikDagilimi= computed(()=> {
    const say= (p:string) =>  this.jobs().filter(j=> j.priority===p && (j.status==='Beklemede' || j.status === 'DevamEdiyor')).length

    const ham=[
      {oncelik: 'Dusuk', etiket: 'Düşük', sayi: say('Dusuk')},
      {oncelik: 'Normal', etiket: 'Normal', sayi: say('Normal')},
      {oncelik: 'Yuksek', etiket: 'Yuksek', sayi: say('Yuksek')},
      {oncelik: 'Acil', etiket: 'Acil', sayi:say('Acil')},
    ];
    const enBuyuk = Math.max(...ham.map(x => x.sayi), 1);
    return ham.map(x => ({ ...x, yuzde: (x.sayi / enBuyuk) * 100 }));
  })

    dikkatGerekenler = computed(() => {
    const simdi = Date.now();
    const gunMs = 1000 * 60 * 60 * 24;
    const sinir = simdi + 7 * gunMs;

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
 

  asamaDagilimi = computed(()=> {
    const devam = this.jobs().filter(j=> j.status ==='DevamEdiyor');
    const ham = this.asamaSirasi.map( a => ({
      asama: a,
      sayi: devam.filter(j=> j.stage ===a).length,
    }));
    const enBuyuk = Math.max(...ham.map(x=> x.sayi), 1);
    return ham.map(x=>({...x, yuzde: (x.sayi/enBuyuk)*100}))
  });

    aylikTrend = computed(() => {
    const simdi = new Date();
    const aylar = [];

    for (let i = 5; i >= 0; i--) {
      const tarih = new Date(simdi.getFullYear(), simdi.getMonth() - i, 1);
      const ay = tarih.getMonth();
      const yil = tarih.getFullYear();

      const acilan = this.jobs().filter(j => {
        const d = new Date(j.createdAt);
        return d.getMonth() === ay && d.getFullYear() === yil;
      }).length;

      const kapanan = this.jobs().filter(j => {
        if (!j.completedAt) return false;
        const d = new Date(j.completedAt);
        return d.getMonth() === ay && d.getFullYear() === yil;
      }).length;

      aylar.push({ anahtar: `${yil}-${ay}`, tarih, acilan, kapanan });
    }

    const enBuyuk = Math.max(...aylar.flatMap(a => [a.acilan, a.kapanan]), 1);

    return aylar.map(a => ({
      ...a,
      acilanYuzde: (a.acilan / enBuyuk) * 100,
      kapananYuzde: (a.kapanan / enBuyuk) * 100,
    }));
  });
    
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