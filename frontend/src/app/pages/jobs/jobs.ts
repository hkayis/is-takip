import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { JobApi, Job, JobDetail } from '../../services/job-api';
import { YeniIsDialog } from '../../dialogs/yeni-is-dialog/yeni-is-dialog';
import {DatePipe} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { durumAdi, oncelikAdi, oncelikPuani } from '../../etiketler';
import { DurumDialog } from '../../dialogs/durum-dialog/durum-dialog';
import { OnayDialog } from '../../dialogs/onay-dialog/onay-dialog';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-jobs',
  imports: [FormsModule,DatePipe,MatIconModule ,MatSnackBarModule ,MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDialogModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs implements OnInit {
    private snackBar = inject(MatSnackBar);
  private jobApi = inject(JobApi);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
    protected durumAdi = durumAdi;
  protected oncelikAdi = oncelikAdi;
  asamaSirasi: string[] = ['Plan', 'Design', 'Develop', 'Test', 'Deploy', 'Review'];
  jobs = signal<Job[]>([]);

  bekleyenler = computed(() => this.jobs().filter(j => j.status === 'Beklemede'));
  devamEdenler = computed(() => this.jobs().filter(j => j.status === 'DevamEdiyor'));
  tamamlananlar = computed(() => this.jobs().filter(j => j.status === 'Tamamlandi'));
  doluAsamalar = computed(() =>
    this.asamaSirasi.filter(a => this.devamEdenler().some(j => j.stage === a))
  );
  seciliDetay = signal<JobDetail | null>(null);

  // Liste görünümü durumu
  gorunum = signal<'liste' | 'pano'>('liste');
  arama = signal('');
  durumFiltre = signal('hepsi');
  oncelikFiltre = signal('hepsi');
  siralamaAlani =signal('varsayilan')
  siralamaYonu= signal<'artan' | 'azalan'>('artan');
     siralamayiDegistir(alan: string) {
    if (this.siralamaAlani() !== alan) {
      this.siralamaAlani.set(alan);
      this.siralamaYonu.set('artan');
    } else if (this.siralamaYonu() === 'artan') {
      this.siralamaYonu.set('azalan');
    } else {
      this.siralamaAlani.set('varsayilan');   // 3. tık → varsayılana dön
    }
  }
  siralamaOku(alan: string): string {
    if (this.siralamaAlani() !== alan) return '';
    return this.siralamaYonu() === 'artan' ? '▲' : '▼';
  }

  private siralamaDegeri(job: Job, alan: string): number | string {
    switch (alan) {
      case 'id':       return job.id;
      case 'title':    return job.title.toLowerCase();
      case 'priority': return oncelikPuani(job.priority);
      case 'status':   return job.status;
      case 'stage':    return job.stage ? this.asamaSirasi.indexOf(job.stage) : -1;
      case 'efor':     return (job.adam ?? 0) * (job.gun ?? 0);
      case 'deadline': return new Date(job.deadline).getTime();
      default:         return 0;
    }
  }

    filtrelenmisIsler = computed(() => {
    const metin = this.arama().toLowerCase().trim();
    const durum = this.durumFiltre();
    const oncelik = this.oncelikFiltre();
    const alan = this.siralamaAlani();
    const yon = this.siralamaYonu() === 'artan' ? 1 : -1;

    const liste = this.jobs()
      .filter(j => durum === 'hepsi' || j.status === durum)
      .filter(j => oncelik === 'hepsi' || j.priority === oncelik)
      .filter(j => j.title.toLowerCase().includes(metin));

    if (alan === 'varsayilan') {
      return liste.sort((a, b) => {
        const oncelikFarki = oncelikPuani(b.priority) - oncelikPuani(a.priority);
        if (oncelikFarki !== 0) return oncelikFarki;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    }

    return liste.sort((a, b) => {
      const av = this.siralamaDegeri(a, alan);
      const bv = this.siralamaDegeri(b, alan);

      if (typeof av === 'string' && typeof bv === 'string') {
        return av.localeCompare(bv, 'tr') * yon;
      }
      return ((av as number) - (bv as number)) * yon;
    });
  });
  

    ngOnInit() {
    const durum = this.route.snapshot.queryParamMap.get('durum');
    if (durum) {
      this.durumFiltre.set(durum);
    }

    const oncelik = this.route.snapshot.queryParamMap.get('oncelik');
    if (oncelik) {
      this.oncelikFiltre.set(oncelik);
    }
    const sec = this.route.snapshot.queryParamMap.get('sec');
    if (sec) {
      this.detayYukle(Number(sec));
    }
    this.yukle();
  }
  asamaninIsleri(asama: string){
    return this.devamEdenler().filter(x=> x.stage==asama);
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
    duzenleAc(job: Job) {
    const ref = this.dialog.open(YeniIsDialog, { width: '420px', data: job });
    ref.afterClosed().subscribe((sonuc) => {
      if (!sonuc) return;
      this.jobApi.update(job.id, {
        title: sonuc.title,
        description: sonuc.description,
        deadline: sonuc.deadline,
        priority: sonuc.priority,
        adam: sonuc.adam,
        gun: sonuc.gun,
      }).subscribe({
        next: () => {
          this.detayYukle(job.id);
          this.yukle();
        },
        error: () => this.snackBar.open('İş güncellenemedi.', 'Tamam', { duration: 4000 }),
      });
    });
  }

  sec(job: Job) {
    this.detayYukle(job.id);
  }

  detayYukle(id: number) {
    this.jobApi.getById(id).subscribe({
      next: (veri) => {
        this.seciliDetay.set(veri);
        
      },
      error: (err) => console.error('Detay alınamadı:', err),
    });
  }

  kapat() {
    this.seciliDetay.set(null);
    
  }

    durumDialogAc(job: Job | JobDetail) {
    const ref = this.dialog.open(DurumDialog, {
      width: '420px',
      data: { title: job.title, status: job.status, stage: job.stage },
    });

    ref.afterClosed().subscribe((sonuc) => {
      if (!sonuc) return;
      this.jobApi.changeStatus(job.id, sonuc).subscribe({
        next: () => {
          if (this.seciliDetay()?.id === job.id) {
            this.detayYukle(job.id);
          }
          this.yukle();
        },
        error: () => this.snackBar.open('Durum değiştirilemedi.', 'Tamam', { duration: 4000 }),
      });
    });
  }

  sil(job: Job){
    const ref = this.dialog.open(OnayDialog, {
      data:{
        baslik:'İşi sil',
        mesaj: `"${job.title}" kalıcı olarak silinecek. Geçmiş kayıtları da gidecek. Bu işlem geri alınamaz.`,
        onayMetni: 'Sil',
      },
    });

    ref.afterClosed().subscribe((onay)=>{
      if(!onay) return
      this.jobApi.delete(job.id).subscribe({
        next: ()=>{
          if(this. seciliDetay()?.id===job.id){
            this.kapat();
          }
          this.yukle();
        },
        error: ()=> this.snackBar.open('İş silinemedi.', 'Tamam', {duration: 4000}),
      });
    });
  }

  gecikmeDurumu(job: Job | JobDetail): string | null {
    if(job.status === 'Tamamlandi' || job.status === 'Iptal') return null;
    
    const gunMs= 1000 * 60 * 60 * 24;

    const kalanGun= Math.ceil((new Date(job.deadline).getTime() - Date.now())/gunMs);

    if(kalanGun<0) return 'gecikti';
    if (kalanGun <7) return 'yakin';
    return null;
  }
}