import { Component, computed, input, signal } from '@angular/core';
import { Job } from '../../services/job-api';
import { buyuklukAdi } from '../../etiketler';

const BUYUKLUK_SIRASI = ['FastTrack', 'XS', 'S', 'M', 'L', 'XL'];

@Component({
  selector: 'app-buyukluk-karti',
  templateUrl: './buyukluk-karti.html',
  styleUrl: './buyukluk-karti.scss',
  host: { class: 'kutu' },
})
export class BuyuklukKarti {
  jobs = input.required<Job[]>();

  protected kapsam = signal<'Beklemede' | 'DevamEdiyor'>('DevamEdiyor');

  protected kapsamSec(k: 'Beklemede' | 'DevamEdiyor') {
    this.kapsam.set(k);
  }

  protected dagilim = computed(() => {
    const kapsam = this.kapsam();
    const isler = this.jobs().filter(j => j.status === kapsam);

    const ham = BUYUKLUK_SIRASI.map(kod => ({
      kod,
      etiket: buyuklukAdi(kod),
      sayi: isler.filter(j => j.buyukluk === kod).length,
    }));

    const enBuyuk = Math.max(...ham.map(x => x.sayi), 1);
    return ham.map(x => ({ ...x, yuzde: (x.sayi / enBuyuk) * 100 }));
  });

  protected ikisi = computed(() => {
    const say = (kapsam: string, kod: string) =>
      this.jobs().filter(j => j.status === kapsam && j.buyukluk === kod).length;

    const gruplar = [
      { baslik: 'Devam Edenler', kapsam: 'DevamEdiyor' },
      { baslik: 'Beklemede', kapsam: 'Beklemede' },
    ].map(g => ({
      baslik: g.baslik,
      satirlar: BUYUKLUK_SIRASI.map(kod => ({
        kod,
        etiket: buyuklukAdi(kod),
        sayi: say(g.kapsam, kod),
      })),
    }));

    const enBuyuk = Math.max(...gruplar.flatMap(g => g.satirlar.map(s => s.sayi)), 1);

    return gruplar.map(g => ({
      ...g,
      satirlar: g.satirlar.map(s => ({ ...s, yuzde: (s.sayi / enBuyuk) * 100 })),
    }));
  });
}