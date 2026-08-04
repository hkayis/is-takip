import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { durumAdi } from '../../etiketler';

@Component({
  selector: 'app-durum-dialog',
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './durum-dialog.html',
  styleUrl: './durum-dialog.scss',
})
export class DurumDialog {
  private dialogRef = inject(MatDialogRef<DurumDialog>);
  data = inject<{ title: string; status: string; stage: string | null }>(MAT_DIALOG_DATA);

  protected durumAdi = durumAdi;

  yeniDurum = this.data.status;
  yeniAsama: string | null = this.data.stage;
  not = '';

  get degistiMi(): boolean {
    if (this.yeniDurum !== this.data.status) return true;
    if (this.yeniDurum === 'DevamEdiyor' && this.yeniAsama !== this.data.stage) return true;
    return false;
  }

  kaydet() {
    this.dialogRef.close({
      newStatus: this.yeniDurum,
      newStage: this.yeniDurum === 'DevamEdiyor' ? this.yeniAsama : null,
      note: this.not.trim() || null,
    });
  }

  iptal() {
    this.dialogRef.close();
  }
}