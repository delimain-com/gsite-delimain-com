import {ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, inject, signal, WritableSignal} from '@angular/core';
import {Observable, Subject, switchMap, take, tap} from "rxjs";
import {ApiService} from "../../../service/api/api.service";
import {UtilService} from "../../../service/util/util.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {DecimalPipe} from "@angular/common";
import {InfoModel} from "../../../model/info.model";
import {FormsModule} from "@angular/forms";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {SiteInfoService} from "../../../service/site-info/site-info.service";
import {NotifyMessageService} from "../../../service/notify-message/notify-message.service";
import {injectQueryParams} from "ngxtension/inject-query-params";

@Component({
	selector: 'app-info-list',
	imports: [
		FormsModule,
		DecimalPipe,
		RouterLink
	],
	templateUrl: './info-list.component.html',
	styleUrl: './info-list.component.scss'
})
export default class InfoListComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

	public util: UtilService = inject(UtilService);

	private api: ApiService = inject(ApiService);

	public notifyMessage: NotifyMessageService = inject(NotifyMessageService);
	public $isReady: WritableSignal<boolean> = signal(false);

	public $queryParams = injectQueryParams();
	public $q_title: WritableSignal<any> = signal(undefined);
	public $q_page: WritableSignal<number> = signal(1);
	public $q_limit: WritableSignal<number> = signal(100);

	public siteInfo: SiteInfoService = inject(SiteInfoService);
	public $params = computed(() => {
		const params: any = {query: {}};
		{
			const title = this.$q_title();
			title && (params.query.title = title.trim());
		}
		return params;
	});

	public $infoList: WritableSignal<InfoModel[] | undefined> = signal(undefined);
	public $infoListCount: WritableSignal<number | undefined> = signal(undefined);

	public activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	constructor() {
		this.activatedRoute.queryParams
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => this.$isReady.set(false)),
				switchMap(() => this.load()),
				tap(() => this.$isReady.set(true)),
				take(1)
			)
			.subscribe();
	}

	$load_isWait: WritableSignal<boolean> = signal(false);

	load(): Observable<any> {
		this.$load_isWait.set(true);
		const params: any = this.$params();
		return this.api.post('page/infoList/load', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					this.$infoList.set(results.infoList || []);
					this.$infoListCount.set(results.infoListCount || 0);
					this.$load_isWait.set(false);
				}),
				take(1)
			);
	}

	load$ = (() => {
		const load$ = new Subject();
		load$
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				switchMap(() => this.load())
			)
			.subscribe();
		return load$;
	})();

	action_load(): void {
		this.load()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			);

	}

	$load_infoList_isWait: WritableSignal<boolean> = signal(false);

	load_infoList(): Observable<any> {
		this.$load_infoList_isWait.set(true);
		{
			this.$infoList.set(undefined);
			this.$infoListCount.set(undefined);
		}
		const params = this.$params();
		return this.api.post('page/infoList/load_infoList', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					this.$infoList.set(results.infoList || []);
					this.$infoListCount.set(results.infoList || 0);
					this.$load_infoList_isWait.set(false);
				}),
				take(1)
			);
	}

	action_load_infoList(): void {
		this.load_infoList()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

	remove_info(info: InfoModel): Observable<any> {
		const params: any = {info};
		this.notifyMessage.show('削除中...');
		return this.api.post('page/infoList/remove_info', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => {
					this.$infoList.update((infoList: any) => {
						return infoList.filter((info: any) => info.uid !== params.info.uid);
					});
					this.notifyMessage.hide('削除しました');
				}),
				take(1)
			);
	}

	action_remove_info(info: InfoModel): void {
		if (!confirm('削除は取り消せません')) {
			return;
		}
		this.remove_info(info)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

	info_viewFlag(info: InfoModel): Observable<any> {
		const params: any = {info: {...info, viewFlag: !info.viewFlag}};
		this.notifyMessage.show('保存中...');
		return this.api.post('page/infoList/save_info_viewFlag', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => {
					info.viewFlag = params.info.viewFlag;
					this.changeDetectorRef.markForCheck();
					this.notifyMessage.hide('保存しました');
				}),
				take(1)
			);
	}

	action_info_viewFlag(info: InfoModel): void {
		this.info_viewFlag(info)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

}
