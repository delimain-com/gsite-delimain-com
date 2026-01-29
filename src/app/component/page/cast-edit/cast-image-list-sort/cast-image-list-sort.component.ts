import {ChangeDetectorRef, Component, DestroyRef, inject, signal, WritableSignal} from '@angular/core';
import {JsonPipe} from "@angular/common";
import {SortablejsModule} from "nxt-sortablejs";
import {SortableOptions} from "sortablejs";

@Component({
	selector: 'app-cast-image-list-sort',
	imports: [
		JsonPipe,
		SortablejsModule
	],
	templateUrl: './cast-image-list-sort.component.html',
	styleUrl: './cast-image-list-sort.component.scss',
	host: {class: 'h-100'}
})
export default class CastImageListSortComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

	castImageListSortableOptions: SortableOptions = {
		handle: '.handle',
		onUpdate: () => {
			let sort = Date.now();
			const castImageList = this.$castImageList() || [];
			this.$castImageList.set(
				castImageList.map((castImage: any) => {
					return {
						...castImage,
						sort: sort--
					};
				}).sort((a: any, b: any) => a.sort - b.sort)
			);
		}
	};

	$castImageList: WritableSignal<any> = signal(undefined);

	castImageList: any;
}
