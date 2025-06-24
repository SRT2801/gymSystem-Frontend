import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin';
import { AuthService } from '../../services/auth.service';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['getUser', 'isAdmin']);

    TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [{ provide: AuthService, useValue: spy }],
    });

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set admin name from auth service', () => {
    authServiceSpy.getUser.and.returnValue({ name: 'Admin User' });
    component.ngOnInit();
    expect(component.adminName).toBe('Admin User');
  });

  it('should handle null user from auth service', () => {
    authServiceSpy.getUser.and.returnValue(null);
    component.ngOnInit();
    expect(component.adminName).toBe('');
  });
});
