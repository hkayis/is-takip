import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class TrDateAdapter extends NativeDateAdapter {
  /** "13.08.2026", "13/08/2026", "13-08-2026" biçimlerini tanır. */
  override parse(value: any): Date | null {
    if (typeof value === 'string' && value.trim()) {
      const eslesme = value.trim().match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
      if (eslesme) {
        const [, gun, ay, yil] = eslesme;
        const tarih = new Date(+yil, +ay - 1, +gun);

        // 32.13.2026 gibi taşan değerleri ele: JS onları sessizce kaydırır
        const gecerli = tarih.getDate() === +gun && tarih.getMonth() === +ay - 1;
        return gecerli ? tarih : null;
      }
    }
    return super.parse(value);   // tanımadıklarını native davranışa bırak
  }
}