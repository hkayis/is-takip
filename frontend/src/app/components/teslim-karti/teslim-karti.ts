import { Component, computed, input } from '@angular/core';
import { Job } from '../../services/job-api';

@Component({
  selector: 'app-teslim-karti',
  templateUrl: './teslim-karti.html',
  styleUrl: './teslim-karti.scss',
  host: { class: 'kutu' },
})
export class TeslimKarti {
  jobs = input.required<Job[]>();

  protected ozet = computed(() => {
    const bitenler = this.jobs().filter(j => j.status === 'Tamamlandi' && j.completedAt);
    const zamaninda = bitenler.filter(j => new Date(j.completedAt!) <= new Date(j.deadline)).length;
    const toplam = bitenler.length;

    return {
      toplam,
      zamaninda,
      gecikmis: toplam - zamaninda,
      oran: toplam ? Math.round((zamaninda / toplam) * 100) : 0,
    };
  });
}