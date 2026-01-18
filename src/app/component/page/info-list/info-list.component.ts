import {Component, DestroyRef, inject, signal, WritableSignal} from '@angular/core';
import {Observable, take, tap} from "rxjs";
import {ApiService} from "../../../service/api/api.service";
import {UtilService} from "../../../service/util/util.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {JsonPipe} from "@angular/common";

@Component({
	selector: 'app-info-list',
	imports: [
		JsonPipe
	],
	templateUrl: './info-list.component.html',
	styleUrl: './info-list.component.scss',
})
export default class InfoListComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	public util: UtilService = inject(UtilService);

	private api: ApiService = inject(ApiService);

	public $isReady: WritableSignal<boolean> = signal(false);

	$results: WritableSignal<any> = signal({});

	constructor() {

	}

	$load_isWait: WritableSignal<boolean> = signal(false);

	load(): Observable<any> {
		this.$load_isWait.set(true);
		const params: any = {};
		return this.api.post('page/infoList/load', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(console.log),
				tap(({results}) => {
					this.$results.set(results);
					this.$load_isWait.set(false);
				}),
				take(1)
			);
	}
}
