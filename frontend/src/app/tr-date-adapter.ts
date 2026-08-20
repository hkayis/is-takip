import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class TrDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (typeof value === 'string' && value.trim()) {
      const eslesme = value.trim().match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
      if (eslesme) {
        const [, gun, ay, yil] = eslesme;
        const tarih = new Date(+yil, +ay - 1, +gun);

        const gecerli = tarih.getDate() === +gun && tarih.getMonth() === +ay - 1;
        return gecerli ? tarih : null;
      }
    }
    return super.parse(value);
  }
}
