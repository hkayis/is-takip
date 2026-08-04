import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnayDialog } from './onay-dialog';

describe('OnayDialog', () => {
  let component: OnayDialog;
  let fixture: ComponentFixture<OnayDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnayDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(OnayDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
