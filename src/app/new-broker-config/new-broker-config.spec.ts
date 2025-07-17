import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBrokerConfig } from './new-broker-config';

describe('NewBrokerConfig', () => {
  let component: NewBrokerConfig;
  let fixture: ComponentFixture<NewBrokerConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewBrokerConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewBrokerConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
