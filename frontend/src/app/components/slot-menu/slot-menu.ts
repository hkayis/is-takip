import { Component, computed, inject, input } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { AyarService } from '../../services/ayar';
import { GRAFIKLER } from '../../grafikler';

@Component({
  selector: 'app-slot-menu',
  imports: [MatMenuModule],
  templateUrl: './slot-menu.html',
  styleUrl: './slot-menu.scss',
})
export class SlotMenu {
  indeks = input.required<number>();

  private ayar = inject(AyarService);

  protected grafikler = GRAFIKLER;

  protected suAnki = computed(() => this.ayar.panoSlotlari()[this.indeks()]);

  protected sec(yeniId: string) {
    const slotlar = [...this.ayar.panoSlotlari()];
    const i = this.indeks();
    if (slotlar[i] === yeniId) return;

    const j = slotlar.indexOf(yeniId);
    if (j === -1) {
      slotlar[i] = yeniId;
    } else {
      [slotlar[i], slotlar[j]] = [slotlar[j], slotlar[i]];
    }

    this.ayar.kaydet({ panoSlotlari: slotlar });
  }
}