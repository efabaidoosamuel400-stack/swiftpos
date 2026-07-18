import { Routes } from '@angular/router';
import { SalesEntryComponent } from './components/sales-entry/sales-entry.component';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
  { path: '', redirectTo: 'sales', pathMatch: 'full' },
  { path: 'sales', component: SalesEntryComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: 'sales' }
];
