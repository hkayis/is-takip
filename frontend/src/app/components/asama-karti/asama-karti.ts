import { Component, computed, input } from '@angular/core';
import { Job } from '../../services/job-api';
import { asamaAdi } from '../../etiketler';

const ASAMA_SIRASI = ['Analiz', 'Gelistirme', 'Test', 'Tasima'];

@Component({
  selector: 'app-asama-karti',
  templateUrl: './asama-karti.html',
  styleUrl: './asama-karti.scss',
  host: { class: 'kutu' },
})
export class AsamaKarti {
  jobs = input.required<Job[]>();

  protected dagilim = computed(() => {
    const devam = this.jobs().filter(j => j.status === 'DevamEdiyor');

    const ham = ASAMA_SIRASI.map(kod => ({
      kod,
      etiket: asamaAdi(kod),
      sayi: devam.filter(j => j.stage === kod).length,
    }));

    const enBuyuk = Math.max(...ham.map(x => x.sayi), 1);
    return ham.map(x => ({ ...x, yuzde: (x.sayi / enBuyuk) * 100 }));
  });
}