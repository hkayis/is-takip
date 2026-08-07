const DURUM_ADLARI: Record<string, string> = {
  Beklemede: 'Bekleyen',
  DevamEdiyor: 'Devam Ediyor',
  Tamamlandi: 'Tamamlandı',
  Iptal: 'İptal',
};

const ONCELIK_ADLARI: Record<string, string> = {
  Dusuk: 'Düşük',
  Normal: 'Normal',
  Yuksek: 'Yüksek',
  Acil: 'Acil',
};

const ONCELIK_PUANLARI: Record<string, number> = {
  Dusuk: 1,
  Normal: 2,
  Yuksek: 3,
  Acil: 4,
};

const ASAMA_ADLARI: Record<string,string> = {
  Analiz: 'Analiz',
  Gelistirme: 'Geliştirme',
  Test: 'Test',
  Tasima: 'Taşıma'
}

export function oncelikPuani(kod: string): number {
  return ONCELIK_PUANLARI[kod] ?? 0;
}

export function asamaAdi(kod: string): string{
  return ASAMA_ADLARI[kod] ?? kod;
}

export function durumAdi(kod: string): string {
  return DURUM_ADLARI[kod] ?? kod;
}

export function oncelikAdi(kod: string): string {
  return ONCELIK_ADLARI[kod] ?? kod;
}

import { BUYUKLUK_ESIKLERI } from "./sabitler";

// Ekranda görünen adlar. Kodlar backend enum'ıyla birebir aynı olmalı.
const BUYUKLUK_ADLARI: Record<string, string> = {
  FastTrack: 'Fast Track',
};

export function buyuklukAdi(kod: string): string {
  return BUYUKLUK_ADLARI[kod] ?? kod;
}

/** Adam-günden önerilen büyüklük kodu (backend JobSize enum adlarıyla aynı). */
export function hesaplananBuyukluk(adam: number, gun: number): string {
  const efor = adam * gun;

  if (efor <= BUYUKLUK_ESIKLERI.FastTrack) return 'FastTrack';
  if (efor <= BUYUKLUK_ESIKLERI.XS) return 'XS';
  if (efor <= BUYUKLUK_ESIKLERI.S) return 'S';
  if (efor <= BUYUKLUK_ESIKLERI.M) return 'M';
  if (efor <= BUYUKLUK_ESIKLERI.L) return 'L';
  return 'XL';
}


