import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rapor } from './rapor';

describe('Rapor', () => {
  let component: Rapor;
  let fixture: ComponentFixture<Rapor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rapor],
    }).compileComponents();

    fixture = TestBed.createComponent(Rapor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
