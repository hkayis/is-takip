import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { JobApi, Job } from '../../services/job-api';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private jobApi = inject(JobApi);

  jobs = signal<Job[]>([]);

  toplam = computed(() => this.jobs().length);
  bekleyen = computed(() => this.jobs().filter(j => j.status === 'Beklemede').length);
  devamEden = computed(() => this.jobs().filter(j => j.status === 'DevamEdiyor').length);
  tamamlanan = computed(() => this.jobs().filter(j => j.status === 'Tamamlandi').length);

  geciken = computed(() => {
    const simdi = new Date();
    return this.jobs().filter(j =>
      j.status !== 'Tamamlandi' &&
      j.status !== 'Iptal' &&
      new Date(j.deadline) < simdi
    ).length;
  });

  ngOnInit() {
    this.jobApi.getAll().subscribe({
      next: (liste) => this.jobs.set(liste),
      error: (err) => console.error('İşler alınamadı:', err),
    });
  }
}