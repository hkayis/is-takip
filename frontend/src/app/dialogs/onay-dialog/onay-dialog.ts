import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-onay-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './onay-dialog.html',
  styleUrl: './onay-dialog.scss',
})
export class OnayDialog {

  private dialogRef = inject(MatDialogRef<OnayDialog>);
  data= inject <{baslik: string; mesaj: string; onayMetni: string}>(MAT_DIALOG_DATA);

  evet(){
    this.dialogRef.close(true);
  }

  hayir(){
    this.dialogRef.close(false)
  }
}
