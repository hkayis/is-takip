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
@Component({
  selector: 'app-jobs',
  imports: [FormsModule,DatePipe , MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDialogModule],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs implements OnInit {
  private jobApi = inject(JobApi);
  private dialog = inject(MatDialog);

  asamaSirasi: string[] = ['Plan', 'Design', 'Develop', 'Test', 'Deploy', 'Review'];
  jobs = signal<Job[]>([]);

  bekleyenler = computed(() => this.jobs().filter(j => j.status === 'Beklemede'));
  devamEdenler = computed(() => this.jobs().filter(j => j.status === 'DevamEdiyor'));
  tamamlananlar = computed(() => this.jobs().filter(j => j.status === 'Tamamlandi'));
  doluAsamalar = computed(() =>
    this.asamaSirasi.filter(a => this.devamEdenler().some(j => j.stage === a))
  );
  seciliDetay = signal<JobDetail | null>(null);

  yeniDurum = '';
  yeniAsama: string | null = null;
  not = '';

  ngOnInit() {
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
        error: (err) => console.error('İş oluşturulamadı:', err),
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
}