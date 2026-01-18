import {Component, DestroyRef, inject, input, output, signal, viewChild, WritableSignal} from '@angular/core';
import {CdkDragHandle} from "@angular/cdk/drag-drop";
import {ImageCroppedEvent, ImageCropperComponent} from "ngx-image-cropper";
import {ApiService} from "../../../../service/api/api.service";
import {UtilService} from "../../../../service/util/util.service";
import {ImageUtilService} from "../../../../service/image-util/image-util.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {take, tap} from "rxjs";

@Component({
	standalone: true,
	selector: 'app-cast-image',
	imports: [
		CdkDragHandle,
		ImageCropperComponent
	],
	templateUrl: './cast-image.component.html',
	styleUrl: './cast-image.component.scss',
})
export default class CastImageComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	private util: UtilService = inject(UtilService);

	private imageUtil: ImageUtilService = inject(ImageUtilService);

	private $imageCropperComponent = viewChild(ImageCropperComponent);

	$castUid = input.required<any>({alias: 'castUid'});

	$itemKey = input.required<string>({alias: 'itemKey'});

	$width = input.required<number>({alias: 'width'});

	$height = input.required<number>({alias: 'height'});

	$isHandle = input<boolean>(false, {alias: 'isHandle'});

	$isEdit: WritableSignal<boolean> = signal(false);

	$isUploading: WritableSignal<boolean> = signal(false);

	$imageCroppedEvent: WritableSignal<ImageCroppedEvent | undefined> = signal(undefined);

	actionRemove = output<any>();

	actionUpload = output<any>();

	actionCancel = output<any>();

	actionComplete = output<{ key: string, path: string, src: string } | any>();

	action_remove(): void {
		this.actionRemove.emit(null);
	}

	action_cancel(): void {
		this.$isEdit.set(false);
		this.actionCancel.emit(null);
	}

	action_complete(): void {
		const imageCroppedEvent = this.$imageCroppedEvent();
		const blob = imageCroppedEvent?.blob;
		if (!blob) {
			return;
		}
		this.$isUploading.set(true);
		const path = `cast/${this.$castUid()}/${this.$itemKey()}_${this.util.ulid()}.png`;
		const params: any = {path, file: blob};
		this.imageUtil.upload(params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					const {key, path, src} = results;
					this.actionComplete.emit({key, path, src});
					this.$isEdit.set(false);
					this.$isUploading.set(false);
				}),
				take(1)
			)
			.subscribe();
	}

}
