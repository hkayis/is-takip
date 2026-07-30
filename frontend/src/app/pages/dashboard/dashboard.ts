import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { JobApi, Job } from '../../services/job-api';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private jobApi = inject(JobApi);

  jobs = signal<Job[]>([]);
  dagilimAcik= signal(true);
  dagilimiCevir(){
    this.dagilimAcik.set(!this.dagilimAcik());
  }
  gecikenAcik=signal(true);
  gecikenCevir(){
    this.gecikenAcik.set(!this.gecikenAcik());
  }
  private router =inject(Router);
  asamaSirasi : string[] = ['Plan', 'Design', 'Test', 'Deploy', 'Review']
  seciliDurum= signal<string | null>(null);
  secDurum(durum: string){
    this.seciliDurum.set(this.seciliDurum()===durum ? null : durum);
  }
  listeyeGit(durum:string){
    this.router.navigate(['/jobs'], {queryParams: {durum}});
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
      geciken: (durum === 'Tamamlandi' || durum ==='Iptal')
       ? 0
       : isler.filter(j=> new Date(j.deadline)<simdi).length,
       asamalar,
    };
  })
  toplam = computed(() => this.jobs().length);
  bekleyen = computed(() => this.jobs().filter(j => j.status === 'Beklemede').length);
  devamEden = computed(() => this.jobs().filter(j => j.status === 'DevamEdiyor').length);
  tamamlanan = computed(() => this.jobs().filter(j => j.status === 'Tamamlandi').length);
  iptal = computed(() => this.jobs().filter(j => j.status === 'Iptal').length);

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
  ngOnInit() {
    this.jobApi.getAll().subscribe({
      next: (liste) => this.jobs.set(liste),
      error: (err) => console.error('İşler alınamadı:', err),
    });
  }
}