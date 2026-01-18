import {Routes} from '@angular/router';
import LayoutComponent from "./component/layout/layout.component";

export const routes: Routes = [
	{
		path: '',
		// component: LayoutComponent,
		children: [
			{path: '', loadComponent: () => import('./component/page/home/home.component')},
			{path: 'home', loadComponent: () => import('./component/page/home/home.component')},
			{path: 'siteList', loadComponent: () => import('./component/page/site-list/site-list.component')},
			{path: 'castList', loadComponent: () => import('./component/page/cast-list/cast-list.component')},
			{path: 'castEdit', loadComponent: () => import('./component/page/cast-edit/cast-edit.component')},
			{path: 'castAdd', loadComponent: () => import('./component/page/cast-add/cast-add.component')},
			{path: 'castScheduleDatetimeList', loadComponent: () => import('./component/page/cast-schedule-datetime-list/cast-schedule-datetime-list.component')},
			{path: 'infoList', loadComponent: () => import('./component/page/info-list/info-list.component')},
			{path: 'infoEdit', loadComponent: () => import('./component/page/info-edit/info-edit.component')},
			{path: 'infoAdd', loadComponent: () => import('./component/page/info-add/info-add.component')},
		]
	}
];

/*export const routes: Routes = [
 {path: '', loadComponent: () => import('./component/page/home/home.component')},
 {path: 'home', loadComponent: () => import('./component/page/home/home.component')},
 {path: 'siteList', loadComponent: () => import('./component/page/site-list/site-list.component')},
 {path: 'castList', loadComponent: () => import('./component/page/cast-list/cast-list.component')}
 ];*/
