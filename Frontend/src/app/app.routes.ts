import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { CategoriesAddComponent } from './components/categories-add/categories-add.component';
import { CategoriesDetailsComponent } from './components/categories-details/categories-details.component';
import { TransactionsAddComponent } from './components/transactions-add/transactions-add.component';
import { TransactionsDetailsComponent } from './components/transactions-details/transactions-details.component';
import { DbComponent } from './components/db/db.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'categories/add', component: CategoriesAddComponent },
  { path: 'categories/:categoryId', component: CategoriesDetailsComponent },
  { path: 'categories/:categoryId/transactions/add', component: TransactionsAddComponent },
  { path: 'transactions/:id', component: TransactionsDetailsComponent },
  { path: 'database/reset', component: DbComponent }
];
