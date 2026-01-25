import {Component, input, model, output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {AngularEditorModule} from "@kolkov/angular-editor";

@Component({
	selector: 'app-el-text-editor',
	imports: [
		FormsModule,
		AngularEditorModule
	],
	templateUrl: './el-text-editor.component.html',
	styleUrl: './el-text-editor.component.scss',
})
export default class ElTextEditorComponent {
	// value = input.required<string>({alias: 'value'});
	// valueChange = output<string>({alias: 'valueChange'});
	value = model.required<string>();
	constructor() {

	}
}
