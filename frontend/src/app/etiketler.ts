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

const BUYUKLUK_ADLARI: Record<string, string> = {
  FastTrack: 'Fast Track',
};

export function buyuklukAdi(kod: string): string {
  return BUYUKLUK_ADLARI[kod] ?? kod;
}

export function hesaplananBuyukluk(
  adam: number,
  gun: number,
  esikler: Record<string, number> = BUYUKLUK_ESIKLERI
): string {
  const efor = adam * gun;

  if (efor <= esikler['FastTrack']) return 'FastTrack';
  if (efor <= esikler['XS']) return 'XS';
  if (efor <= esikler['S']) return 'S';
  if (efor <= esikler['M']) return 'M';
  if (efor <= esikler['L']) return 'L';
  return 'XL';
}
export function gecikmeDurumu(job: { deadline: string; status: string }): string | null {
  if (job.status === 'Tamamlandi' || job.status === 'Iptal') return null;

  const gunMs = 1000 * 60 * 60 * 24;
  const kalanGun = Math.ceil((new Date(job.deadline).getTime() - Date.now()) / gunMs);

  if (kalanGun < 0) return 'gecikti';
  if (kalanGun < 7) return 'yakin';
  return null;
}
