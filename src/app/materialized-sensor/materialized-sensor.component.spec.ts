import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterializedSensorComponent } from './materialized-sensor.component';

describe('MaterializedSensorComponent', () => {
  let component: MaterializedSensorComponent;
  let fixture: ComponentFixture<MaterializedSensorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterializedSensorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterializedSensorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
