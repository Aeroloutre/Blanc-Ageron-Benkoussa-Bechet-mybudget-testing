import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-categories-add',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './categories-add.component.html',
  styleUrl: './categories-add.component.css'
})
export class CategoriesAddComponent {
  categorieForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.categorieForm = this.fb.group({
      label: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  onSubmit() {
    console.log('[CategoriesAddComponent] Form valid:', this.categorieForm.valid);
    console.log('[CategoriesAddComponent] Form value:', this.categorieForm.value);
    
    if (this.categorieForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = null;
      
      const categoryData = {
        label: this.categorieForm.value.label
      };

      console.log('[CategoriesAddComponent] Submitting category:', categoryData);

      this.categoryService.createCategory(categoryData).subscribe({
        next: (category) => {
          console.log('[CategoriesAddComponent] Category created successfully:', category);
          this.router.navigate(['/categories']);
        },
        error: (error) => {
          console.error('[CategoriesAddComponent] Error creating category:');
          console.error('  Status:', error.status);
          console.error('  Status Text:', error.statusText);
          console.error('  URL:', error.url);
          console.error('  Error:', error.error);
          console.error('  Full error object:', error);
          this.errorMessage = 'Impossible de créer la catégorie. Veuillez réessayer.';
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/categories']);
  }
}
