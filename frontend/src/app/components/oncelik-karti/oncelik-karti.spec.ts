import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OncelikKarti } from './oncelik-karti';

describe('OncelikKarti', () => {
  let component: OncelikKarti;
  let fixture: ComponentFixture<OncelikKarti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OncelikKarti],
    }).compileComponents();

    fixture = TestBed.createComponent(OncelikKarti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
