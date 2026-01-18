import {Component, DestroyRef, inject, signal, WritableSignal} from '@angular/core';
import {UtilService} from "../../../service/util/util.service";
import {ApiService} from "../../../service/api/api.service";
import {injectQueryParams} from "ngxtension/inject-query-params";
import {Observable, take, tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
	selector: 'app-info-edit',
	imports: [],
	templateUrl: './info-edit.component.html',
	styleUrl: './info-edit.component.scss',
})
export default class InfoEditComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	public util: UtilService = inject(UtilService);

	private api: ApiService = inject(ApiService);

	public $isReady: WritableSignal<any> = signal(false);

	public $queryParams = injectQueryParams();
	public $q_uid = injectQueryParams('uid');

	constructor() {
		this.load()
			.subscribe();
	}

	load(): Observable<any> {
		const params: any = {query: {}};
		{
			params.query.uid = this.$q_uid();
		}
		return this.api.post('page/infoEdit/load', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(console.log),
				take(1)
			);
	}

}
