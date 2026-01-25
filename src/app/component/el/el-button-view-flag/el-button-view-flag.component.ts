import {Component, model} from '@angular/core';

@Component({
	selector: 'app-el-button-view-flag,el-button-view-flag',
	imports: [],
	templateUrl: './el-button-view-flag.component.html',
	styleUrl: './el-button-view-flag.component.scss',
})
export default class ElButtonViewFlagComponent {

	value = model.required<{ [key: string]: any, viewFlag: boolean }>();

}
