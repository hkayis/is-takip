import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurumDialog } from './durum-dialog';

describe('DurumDialog', () => {
  let component: DurumDialog;
  let fixture: ComponentFixture<DurumDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DurumDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(DurumDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
