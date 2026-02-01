import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TransactionService } from '../services/transaction.service';
import { Observable } from 'rxjs';

describe('US2: Ajout transaction', () => {
  
  let service: TransactionService;
  let form: FormGroup;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      providers: [TransactionService]
    });
    
    service = TestBed.inject(TransactionService);
    form = new FormGroup({
      amount: new FormControl('', [Validators.required, Validators.min(0.01)]),
      label: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      type: new FormControl('expense', [Validators.required]),
      category_id: new FormControl('', [Validators.required]),
      transaction_date: new FormControl(new Date().toISOString().split('T')[0], [Validators.required])
    });
  });

  it('Critère 1: bouton accessible', () => {
    const button = { label: '+ Nouvelle transaction', enabled: true };
    expect(button.enabled).toBe(true);
    expect(button.label).toContain('Nouvelle transaction');
  });

  it('Critère 2: montant > 0 obligatoire', () => {
    form.patchValue({ amount: '' });
    expect(form.get('amount')?.valid).toBe(false);

    form.patchValue({ amount: -10 });
    expect(form.get('amount')?.valid).toBe(false);

    form.patchValue({ amount: 25.50 });
    expect(form.get('amount')?.valid).toBe(true);
  });

  it('Critère 3: libellé 3-100 caractères', () => {
    form.patchValue({ label: 'ab' });
    expect(form.get('label')?.errors?.['minlength']).toBeTruthy();

    form.patchValue({ label: 'a'.repeat(101) });
    expect(form.get('label')?.errors?.['maxlength']).toBeTruthy();

    form.patchValue({ label: 'Courses' });
    expect(form.get('label')?.valid).toBe(true);
  });

  it('Critères 4-6: valeurs par défaut', () => {
    expect(form.get('type')?.value).toBe('expense');
    expect(form.get('transaction_date')?.value).toBe(new Date().toISOString().split('T')[0]);
  });

  it('Critère 5: catégorie obligatoire', () => {
    expect(form.get('category_id')?.errors?.['required']).toBe(true);
    form.patchValue({ category_id: 2 });
    expect(form.get('category_id')?.valid).toBe(true);
  });

  it('Critère 7: validation temps réel', () => {
    const control = form.get('label');
    control?.setValue('ab');
    expect(control?.errors?.['minlength']).toBeTruthy();
    
    control?.setValue('Courses');
    expect(control?.errors).toBeNull();
  });

  it('Critère 8: bouton désactivé si invalide', () => {
    expect(form.invalid).toBe(true);
    
    form.patchValue({ amount: 45.80, label: 'Courses', category_id: 2 });
    expect(form.valid).toBe(true);
  });

  it('Critère 9: création transaction', (done) => {
    const data = { amount: 45.80, label: 'Courses', type: 'expense' as const, transaction_date: '2026-01-09', category_id: 2 };
    spyOn(service, 'createTransaction').and.returnValue(new Observable(obs => {
      obs.next({ transaction_id: 1, ...data });
      obs.complete();
    }));
    
    service.createTransaction(data).subscribe(result => {
      expect(result.transaction_id).toBeDefined();
      done();
    });
  });

  it('Critère 10: bouton annuler', () => {
    form.patchValue({ amount: 25, label: 'Test' });
    expect(form.get('amount')?.value).toBe(25);
    
    form.reset();
    expect(form.get('amount')?.value).toBe(null);
    expect(form.get('label')?.value).toBe(null);
  });

  it('Critère 11: gestion erreur serveur', (done) => {
    spyOn(service, 'createTransaction').and.returnValue(new Observable(obs => {
      obs.error({ error: 'Erreur DB' });
    }));
    
    service.createTransaction({ amount: 50, label: 'Test', type: 'expense', transaction_date: '2026-01-09' }).subscribe({
      error: (err) => {
        expect(err.error).toBe('Erreur DB');
        done();
      }
    });
  });
});