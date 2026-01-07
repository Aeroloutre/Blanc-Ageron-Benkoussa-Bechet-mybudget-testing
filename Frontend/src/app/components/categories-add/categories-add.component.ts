import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories-add',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './categories-add.component.html',
  styleUrl: './categories-add.component.css'
})
export class CategoriesAddComponent {
  categorieForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.categorieForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      budget: [0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit() {
    if (this.categorieForm.valid) {
      console.log('Nouvelle catégorie:', this.categorieForm.value);
      // Logique pour enregistrer la catégorie (à implémenter avec le service)
      this.categorieForm.reset();
    }
  }

  onCancel() {
    this.categorieForm.reset();
  }
}
