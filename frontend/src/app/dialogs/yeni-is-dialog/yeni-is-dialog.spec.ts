import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YeniIsDialog } from './yeni-is-dialog';

describe('YeniIsDialog', () => {
  let component: YeniIsDialog;
  let fixture: ComponentFixture<YeniIsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YeniIsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(YeniIsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
