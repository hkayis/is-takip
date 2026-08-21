import { Component, computed, input } from '@angular/core';
import { Job } from '../../services/job-api';

const GUN_MS = 1000 * 60 * 60 * 24;

const KOVALAR = [
  { id: 'erken',     etiket: 'Erken',     ust: 0.8 },
  { id: 'zamaninda', etiket: 'Zamanında', ust: 1.0 },
  { id: 'azasan',    etiket: 'Az aşan',   ust: 1.5 },
  { id: 'cokasan',   etiket: 'Çok aşan',  ust: Infinity },
];

@Component({
  selector: 'app-tahmin-karti',
  templateUrl: './tahmin-karti.html',
  styleUrl: './tahmin-karti.scss',
  host: { class: 'kutu' },
})
export class TahminKarti {
  jobs = input.required<Job[]>();

  protected oranlar = computed(() =>
    this.jobs()
      .filter(j => j.status === 'Tamamlandi' && j.completedAt)
      .map(j => {
        const basla = new Date(j.createdAt).getTime();
        const planlanan = (new Date(j.deadline).getTime() - basla) / GUN_MS;
        const gercek = (new Date(j.completedAt!).getTime() - basla) / GUN_MS;
        return planlanan > 0 ? gercek / planlanan : null;
      })
      .filter((o): o is number => o !== null)
  );

  protected ortanca = computed(() => {
    const s = [...this.oranlar()].sort((a, b) => a - b);
    if (s.length === 0) return 0;

    const orta = Math.floor(s.length / 2);
    const deger = s.length % 2 ? s[orta] : (s[orta - 1] + s[orta]) / 2;
    return Math.round(deger * 100);
  });

  protected dagilim = computed(() => {
    const ham = KOVALAR.map(k => ({ ...k, sayi: 0 }));

    for (const oran of this.oranlar()) {
      ham.find(k => oran <= k.ust)!.sayi++;
    }

    const enBuyuk = Math.max(...ham.map(k => k.sayi), 1);
    return ham.map(k => ({ ...k, yuzde: (k.sayi / enBuyuk) * 100 }));
  });
}