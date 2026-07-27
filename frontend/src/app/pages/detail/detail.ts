import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { JobApi, JobDetail } from '../../services/job-api';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-detail',
  imports: [FormsModule, MatCardModule,MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class Detail implements OnInit {
  private route = inject(ActivatedRoute);
  private jobApi = inject(JobApi);

  job = signal<JobDetail | null>(null);

  yeniDurum = '';
  yeniAsama: string | null = null;
  not = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.yukle(id);
  }

  yukle(id: number) {
    this.jobApi.getById(id).subscribe({
      next: (veri) => this.job.set(veri),
      error: (err) => console.error('Detay alınamadı:', err),
    });
  }

  durumDegistir() {
    const mevcut = this.job();
    if (!mevcut) return;

    this.jobApi.changeStatus(mevcut.id, {
      newStatus: this.yeniDurum,
      newStage: this.yeniDurum === 'DevamEdiyor' ? this.yeniAsama : null,
      note: this.not || null,
    }).subscribe({
      next: () => {
        this.not = '';
        this.yukle(mevcut.id);
      },
      error: (err) => console.error('Durum değiştirilemedi:', err),
    });
  }
}