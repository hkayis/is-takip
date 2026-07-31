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
@Component({
  selector: 'app-jobs',
  imports: [FormsModule,DatePipe ,MatSnackBarModule ,MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDialogModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs implements OnInit {
    private snackBar = inject(MatSnackBar);
  private jobApi = inject(JobApi);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
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
  filtrelenmisIsler = computed(() => {
    const metin = this.arama().toLowerCase().trim();
    const durum = this.durumFiltre();
    const oncelik = this.oncelikFiltre();
    return this.jobs()
      .filter(j => durum === 'hepsi' || j.status === durum)
      .filter(j => oncelik === 'hepsi' || j.priority === oncelik)
      .filter(j => j.title.toLowerCase().includes(metin))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  yeniDurum = '';
  yeniAsama: string | null = null;
  not = '';

    ngOnInit() {
    const durum = this.route.snapshot.queryParamMap.get('durum');
    if (durum) {
      this.durumFiltre.set(durum);
    }

    const oncelik = this.route.snapshot.queryParamMap.get('oncelik');
    if (oncelik) {
      this.oncelikFiltre.set(oncelik);
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
    duzenleAc(job: JobDetail) {
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
        this.yeniDurum = '';
        this.yeniAsama = null;
        this.not = '';
      },
      error: (err) => console.error('Detay alınamadı:', err),
    });
  }

  kapat() {
    this.seciliDetay.set(null);
    this.yeniDurum = '';
    this.yeniAsama = null;
    this.not = '';
  }

  durumDegistir() {
    const mevcut = this.seciliDetay();
    if (!mevcut) return;

    this.jobApi.changeStatus(mevcut.id, {
      newStatus: this.yeniDurum,
      newStage: this.yeniDurum === 'DevamEdiyor' ? this.yeniAsama : null,
      note: this.not || null,
    }).subscribe({
      next: () => {
        this.not = '';
        this.detayYukle(mevcut.id);
        this.yukle();
      },
      error: (err) => console.error('Durum değiştirilemedi:', err),
    });
  }

  sil(id: number) {
    this.jobApi.delete(id).subscribe({
      next: () => {
        if (this.seciliDetay()?.id === id) {
          this.kapat();
        }
        this.yukle();
      },
      error: (err) => console.error('İş silinemedi:', err),
    });
  }
  gecikmeDurumu(job: Job | JobDetail): string | null {
    if(job.status === 'Tamamlandi' || job.status === 'Iptal') return null;
    
    const gunMs= 1000 * 60 * 60 * 24;

    const kalanGun= Math.ceil((new Date(job.deadline).getTime() - Date.now())/gunMs);

    if(kalanGun<0) return 'gecikti';
    if (kalanGun <3) return 'yakin';
    return null;
  }
}