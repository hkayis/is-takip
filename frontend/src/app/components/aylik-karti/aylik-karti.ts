import { Component, computed, input } from '@angular/core';
import { Job } from '../../services/job-api';

const AY_ADLARI = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

@Component({
  selector: 'app-aylik-karti',
  templateUrl: './aylik-karti.html',
  styleUrl: './aylik-karti.scss',
  host: { class: 'kutu' },
})
export class AylikKarti {
  jobs = input.required<Job[]>();

  protected aylar = computed(() => {
    const simdi = new Date();

    const kovalar = Array.from({ length: 6 }, (_, i) => {
      const t = new Date(simdi.getFullYear(), simdi.getMonth() - (5 - i), 1);
      return {
        yil: t.getFullYear(),
        ay: t.getMonth(),
        etiket: `${AY_ADLARI[t.getMonth()]} ${String(t.getFullYear()).slice(2)}`,
        sayi: 0,
      };
    });

    for (const j of this.jobs()) {
      if (j.status !== 'Tamamlandi' || !j.completedAt) continue;
      const bitis = new Date(j.completedAt);
      const kova = kovalar.find(k => k.yil === bitis.getFullYear() && k.ay === bitis.getMonth());
      if (kova) kova.sayi++;
    }

    const enBuyuk = Math.max(...kovalar.map(k => k.sayi), 1);
    return kovalar.map(k => ({ ...k, yuzde: (k.sayi / enBuyuk) * 100 }));
  });
}