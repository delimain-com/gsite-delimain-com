import {Component, DestroyRef, effect, inject, input, output, signal, WritableSignal} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {Observable, take, tap} from "rxjs";
import {ApiService} from "../../../../service/api/api.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {JsonPipe} from "@angular/common";

@Component({
	selector: 'app-cast-section-list',
	imports: [
		JsonPipe
	],
	templateUrl: './cast-section-list.component.html',
	styleUrl: './cast-section-list.component.scss',
})
export default class CastSectionListComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	private api: ApiService = inject(ApiService);

	$select_castSectionItem = input.required<any>({alias: 'select_castSectionItem'});

	$castSectionList: WritableSignal<any> = signal(undefined);

	actionClose = output();

	constructor() {
		effect(() => {
			const select_castSectionItem = this.$select_castSectionItem();
			if (!select_castSectionItem?.uid) {
				return;
			}
			this.action_load_castSectionList();
		});
	}

	$load_castSectionList_isWait: WritableSignal<boolean> = signal(false);

	load_castSectionList(): Observable<any> {
		this.$load_castSectionList_isWait.set(true);
		const params: any = {
			query: {
				itemUid: this.$select_castSectionItem()?.uid
			}
		};
		return this.api.post('page/castList/load_castSectionList', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					this.$castSectionList.set(results?.castSectionList || []);
					this.$load_castSectionList_isWait.set(false);
				}),
				take(1)
			);
	}

	action_load_castSectionList(): void {
		this.load_castSectionList()
			.subscribe();
	}

}
