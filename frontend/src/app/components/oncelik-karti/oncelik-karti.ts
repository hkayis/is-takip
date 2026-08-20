import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Job } from '../../services/job-api';

@Component({
  selector: 'app-oncelik-karti',
  templateUrl: './oncelik-karti.html',
  styleUrl: './oncelik-karti.scss',
  host: { class: 'kutu' },
})
export class OncelikKarti {
  jobs = input.required<Job[]>();

  private router = inject(Router);

  protected dagilim = computed(() => {
    const say = (p: string) =>
      this.jobs().filter(j => j.priority === p && j.status === 'DevamEdiyor').length;

    const ham = [
      { oncelik: 'Dusuk', etiket: 'Düşük', sayi: say('Dusuk') },
      { oncelik: 'Normal', etiket: 'Normal', sayi: say('Normal') },
      { oncelik: 'Yuksek', etiket: 'Yuksek', sayi: say('Yuksek') },
      { oncelik: 'Acil', etiket: 'Acil', sayi: say('Acil') },
    ];

    const enBuyuk = Math.max(...ham.map(x => x.sayi), 1);
    return ham.map(x => ({ ...x, yuzde: (x.sayi / enBuyuk) * 100 }));
  });

  protected listeyiAc(oncelik: string) {
    this.router.navigate(['/jobs'], { queryParams: { oncelik } });
  }
}