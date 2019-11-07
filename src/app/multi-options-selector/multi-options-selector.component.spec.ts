import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiOptionsSelectorComponent } from './multi-options-selector.component';

describe('MultiOptionsSelectorComponent', () => {
  let component: MultiOptionsSelectorComponent;
  let fixture: ComponentFixture<MultiOptionsSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiOptionsSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiOptionsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
