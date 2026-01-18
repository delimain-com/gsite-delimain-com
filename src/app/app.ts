import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import ComponentRootComponent from "./component/component-root/component-root.component";

@Component({
	selector: 'app-root',
	imports: [ComponentRootComponent],
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App {
}
