import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotMenu } from './slot-menu';

describe('SlotMenu', () => {
  let component: SlotMenu;
  let fixture: ComponentFixture<SlotMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
