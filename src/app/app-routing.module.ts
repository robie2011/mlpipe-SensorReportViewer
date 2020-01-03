import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnalysisDescriptionComponent } from './analysis-description/analysis-description.component';
import { ReportingComponent } from './reporting/reporting.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', component: AnalysisDescriptionComponent},
  { path: 'report/:name', pathMatch: 'full', component: ReportingComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
