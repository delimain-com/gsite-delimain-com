import {Component, computed, DestroyRef, inject, signal, WritableSignal} from '@angular/core';
import {Observable, switchMap, take, tap} from "rxjs";
import {ApiService} from "../../../service/api/api.service";
import {UtilService} from "../../../service/util/util.service";
import {NotifyMessageService} from "../../../service/notify-message/notify-message.service";
import {injectQueryParams} from "ngxtension/inject-query-params";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ActivatedRoute} from "@angular/router";

@Component({
	selector: 'app-link-list',
	imports: [],
	templateUrl: './link-list.component.html',
	styleUrl: './link-list.component.scss',
})
export default class LinkListComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	public util: UtilService = inject(UtilService);
	public notifyMessage: NotifyMessageService = inject(NotifyMessageService);

	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	private api: ApiService = inject(ApiService);

	$domain = injectQueryParams('domain');

	$params = computed(() => {
		const params: any = {query: {}};
		{
			params.query.limit = 100;
			params.query.offset = 0;
		}
		return params;
	});

	$isReady: WritableSignal<boolean> = signal(false);

	$linkList: WritableSignal<any> = signal(undefined);
	$linkListCount: WritableSignal<any> = signal(undefined);

	constructor() {
		this.activatedRoute.queryParams
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => this.$isReady.set(false)),
				switchMap(() => this.load()),
				tap(() => this.$isReady.set(true))
			)
			.subscribe();
	}

	$load_isWait: WritableSignal<boolean> = signal(false);

	load(): Observable<any> {
		this.$linkList.set(true);
		{
			this.$linkList.set(undefined);
			this.$linkListCount.set(undefined);
		}
		const params: any = this.$params();
		return this.api.post('pgae/linkList/load', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					this.$linkList.set(results.linkList || []);
					this.$linkListCount.set(results.linkListCount || 0);
					this.$linkList.set(false);
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

	$load_linkList_isWait: WritableSignal<boolean> = signal(false);

	load_linkList(): Observable<any> {
		this.$load_linkList_isWait.set(true);
		{
			this.$linkList.set(undefined);
			this.$linkListCount.set(undefined);
		}
		const params: any = this.$params();
		return this.api.post('page/linkList/load_linkList', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					this.$linkList.set(results.linkList || []);
					this.$linkListCount.set(results.linkList || 0);
					this.$load_linkList_isWait.set(false);
				}),
				take(1)
			);
	}

	action_load_linkList(): void {
		this.load_linkList()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

}
