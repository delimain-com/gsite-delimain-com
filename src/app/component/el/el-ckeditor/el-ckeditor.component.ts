import {AfterViewInit, ChangeDetectorRef, Component, inject, input, model, OnInit, output, signal, Signal, WritableSignal} from '@angular/core';
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import {Bold, Change, ClassicEditor, Essentials, FontBackgroundColor, FontColor, FontFamily, ImageUpload, ImageUploadEditing, ImageUploadUI, Italic, Paragraph, ShiftEnter} from "ckeditor5";
import {FormsModule} from "@angular/forms";
import {UtilService} from "../../../service/util/util.service";

@Component({
	selector: 'app-el-ckeditor',
	imports: [
		CKEditorModule,
		FormsModule
	],
	templateUrl: './el-ckeditor.component.html',
	styleUrl: './el-ckeditor.component.scss',
	host: {class: 'm-0 p-0'}
})
export default class ElCkeditorComponent implements AfterViewInit {

	public util: UtilService = inject(UtilService);

	public Editor = ClassicEditor;
	public config = {
		licenseKey: 'GPL', // Or 'GPL'.
		plugins: [Essentials, Paragraph, Bold, Italic, ShiftEnter, FontColor, FontBackgroundColor, FontFamily],
		toolbar: ['bold', 'italic', 'fontColor', 'fontBackgroundColor', 'fontFamily'],
	};

	public $isReady: WritableSignal<boolean> = signal(false);

	public value = model.required<string>();

	constructor() {

	}

	ngAfterViewInit() {
		this.$isReady.set(true);
	}
}
