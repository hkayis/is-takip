import { Component, input, output, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Job } from '../../services/job-api';
import { oncelikAdi, gecikmeDurumu } from '../../etiketler';

@Component({
  selector: 'app-is-kart',
  imports: [DatePipe],
  templateUrl: './is-kart.html',
  styleUrl: './is-kart.scss',
})
export class IsKart {
  // --- Girdiler: ebeveyn ne veriyor ---
  job    = input.required<Job>();
  secili = input(false);
  renk   = input<'bekleyen' | 'devam' | 'tamamlanan'>('devam');

  // --- Çıktı: karta tıklandığında ebeveyne haber ver ---
  secildi = output<Job>();

  protected oncelikAdi = oncelikAdi;
  protected gecikmeDurumu = gecikmeDurumu;

  /** Girdi üzerine kurulu türetilmiş değer */
  protected efor = computed(() => {
    const j = this.job();
    return j.adam && j.gun ? j.adam * j.gun : null;
  });
}