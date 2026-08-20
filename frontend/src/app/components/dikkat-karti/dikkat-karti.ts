import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Job } from '../../services/job-api';
import { AyarService } from '../../services/ayar';
import { oncelikAdi, oncelikPuani } from '../../etiketler';

@Component({
  selector: 'app-dikkat-karti',
  templateUrl: './dikkat-karti.html',
  styleUrl: './dikkat-karti.scss',
  host: { class: 'kutu dikkat-bolum' },
})
export class DikkatKarti {
  jobs = input.required<Job[]>();

  protected oncelikAdi = oncelikAdi;

  private router = inject(Router);
  private ayar = inject(AyarService);

  protected liste = computed(() => {
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
        const skor = oncelikPuani(j.priority) * (10 - fark);

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

  protected isiAc(id: number) {
    this.router.navigate(['/jobs'], { queryParams: { sec: id } });
  }
}