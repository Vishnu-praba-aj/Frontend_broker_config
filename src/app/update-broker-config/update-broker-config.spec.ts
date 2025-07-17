import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBrokerConfig } from './broker-config';

describe('UpdateBrokerConfig', () => {
  let component: UpdateBrokerConfig;
  let fixture: ComponentFixture<UpdateBrokerConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBrokerConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBrokerConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
