import {Component, computed, DestroyRef, inject, signal, WritableSignal} from '@angular/core';
import {injectQueryParams} from "ngxtension/inject-query-params";
import {Observable, switchMap, take, tap} from "rxjs";
import {ApiService} from "../../../service/api/api.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ActivatedRoute} from "@angular/router";

@Component({
	selector: 'app-link-edit',
	imports: [],
	templateUrl: './link-edit.component.html',
	styleUrl: './link-edit.component.scss',
})
export default class LinkEditComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	private api: ApiService = inject(ApiService);

	$q_uid = injectQueryParams('uid');

	$params = computed(() => {
		const params: any = {query: {}};
		{
			params.query.uid = this.$q_uid();
		}
		return params;
	});

	$link: WritableSignal<any> = signal(undefined);

	constructor() {
		this.activatedRoute.queryParams
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				switchMap(() => this.load())
			)
			.subscribe();
	}

	$load_isWait: WritableSignal<boolean> = signal(false);

	load(): Observable<any> {
		this.$load_isWait.set(true);
		const params = this.$params();
		return this.api.post('page/linkEdit/load', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					{
						const now = Date.now();
						const link = results.link || {
							uid: params.query.uid,
							regDatetime: now,
							sort: now
						};
						this.$link.set(link);
					}
					this.$load_isWait.set(true);
				}),
				take(1)
			);
	}

	action_load(): void {
		this.load()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

}
