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
  job    = input.required<Job>();
  secili = input(false);
  renk   = input<'bekleyen' | 'devam' | 'tamamlanan'>('devam');

  secildi = output<Job>();

  protected oncelikAdi = oncelikAdi;
  protected gecikmeDurumu = gecikmeDurumu;

  protected efor = computed(() => {
    const j = this.job();
    return j.adam && j.gun ? j.adam * j.gun : null;
  });
}
