import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Users } from './pages/users/users';
import { Requests } from './pages/requests/requests';
import { Reports } from './pages/reports/reports';

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'users', component: Users },
      { path: 'requests', component: Requests },
      { path: 'reports', component: Reports },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
