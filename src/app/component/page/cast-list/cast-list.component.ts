import {ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, effect, inject, Signal, signal, viewChild, WritableSignal} from '@angular/core';
import {ApiService} from "../../../service/api/api.service";
import {UtilService} from "../../../service/util/util.service";
import {FormsModule} from "@angular/forms";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Observable, Subject, switchMap, take, tap} from "rxjs";
import {ActivatedRoute, ActivatedRouteSnapshot, Params, RouterLink} from "@angular/router";
import {SortablejsModule} from "nxt-sortablejs";
import {Options} from 'sortablejs';
import {NavigationService} from "../../../service/navigation/navigation.service";
import {injectQueryParams} from "ngxtension/inject-query-params";
import {NotifyMessageService} from "../../../service/notify-message/notify-message.service";
import CastSectionListComponent from "./cast-section-list/cast-section-list.component";
import {DecimalPipe, JsonPipe, NgClass} from "@angular/common";
import {RepeatPipe} from "ngxtension/repeat-pipe";
import {injectLocalStorage} from "ngxtension/inject-local-storage";
import {CastModel} from "../../../model/cast.model";
import {NoimageService} from "../../../service/noimage/noimage.service";

@Component({
	selector: 'app-cast-list',
	imports: [
		FormsModule,
		RouterLink,
		SortablejsModule,
		CastSectionListComponent,
		DecimalPipe,
		NgClass,
		RepeatPipe
	],
	templateUrl: './cast-list.component.html',
	styleUrl: './cast-list.component.scss',
	host: {class: 'h-100'}
})
export default class CastListComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	public util: UtilService = inject(UtilService);
	public navigation: NavigationService = inject(NavigationService);
	private api: ApiService = inject(ApiService);
	private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

	public notifyMessage: NotifyMessageService = inject(NotifyMessageService);

	private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

	public noimage: NoimageService = inject(NoimageService);

	public Math: Math = Math;

	public $viewSettings_castSectionClass: WritableSignal<string> = injectLocalStorage('CastListComponent.$viewSettings_castSectionClass', {defaultValue: 'col-2'});
	public $viewSettings_gridTemplateColumnsNumber: WritableSignal<number> = injectLocalStorage('CastListComponent.$viewSettings_gridTemplateColumnsNumber', {defaultValue: 5});
	public $viewSettings_gridTemplateColumns = computed(() => {
		const viewSettings_gridTemplateColumnsNumber = this.$viewSettings_gridTemplateColumnsNumber() || 5;
		return `repeat(${viewSettings_gridTemplateColumnsNumber < 1 ? 5 : viewSettings_gridTemplateColumnsNumber},1fr)`;
	});

	public castListSortableOptions: Options = {
		handle: '.handle',
		onUpdate: () => {
			this.notifyMessage.show('保存中...');
			const params: any = {};
			{
				let sort = Date.now();
				const castList = this.$castList() || [];
				params.castList = castList.map((cast: any) => {
					return {
						...cast,
						sort: sort--
					};
				});

			}
			this.api.post('page/castList/save_castList_sort', params)
				.pipe(
					takeUntilDestroyed(this.#DestroyRef),
					tap(() => {
						this.$castList.set(params.castList);
						this.notifyMessage.hide('保存しました');
					}),
					take(1)
				)
				.subscribe();
		}
	};

	public $isReady: WritableSignal<boolean> = signal(false);

	public $queryParams: Signal<Params> = injectQueryParams();

	public $q_castName: WritableSignal<string> = signal('');
	public $q_viewFlag: WritableSignal<boolean | undefined> = signal(undefined);
	public $q_limit: WritableSignal<number> = signal(100);
	public $q_page: WritableSignal<number> = signal(1);

	public $params = computed(() => {
		const params: any = {query: {}};
		{
			params.query.name = this.$q_castName();
			params.query.viewFlag = this.$q_viewFlag();
			params.query.limit = this.$q_limit();
			params.query.offset = ((this.$q_page() - 1) * this.$q_limit());
		}
		return params;
	});
	public $pageConfig: WritableSignal<any> = signal(undefined);
	public $castList: WritableSignal<any> = signal(undefined);
	public $castListCount: WritableSignal<any> = signal(undefined);
	public $castImageItem: WritableSignal<any> = signal(undefined);

	public $castSectionItemList: WritableSignal<any> = signal(undefined);

	action_select_castSelectionItem(item: any): void {
		const select_castSelectionItem = this.$select_castSectionItem();
		this.$select_castSectionItem.set(select_castSelectionItem?.uid === item.uid ? undefined : item);
	}

	public $select_castSectionItem: WritableSignal<any> = signal(undefined);

	public $castSectionListComponent = viewChild(CastSectionListComponent);

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

	load(): Observable<any> {
		{
			this.$castList.set(undefined);
			this.$castListCount.set(undefined);
		}
		const params: any = this.$params();

		return this.api.post('page/castList/load', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					const {pageConfig, castList, castListCount, castImageItem, castSectionItemList} = results;
					this.$pageConfig.set(pageConfig || {});
					this.$castList.set(castList || []);
					this.$castListCount.set(castListCount || 0);
					this.$castImageItem.set(castImageItem || {});
					this.$castSectionItemList.set(castSectionItemList || []);
					// {
					// 	this.$select_castSectionItem.set(this.$castSectionItemList()?.at(0));
					// }
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

	$load_castList_isWait: WritableSignal<boolean> = signal(false);

	load_castList(): Observable<any> {
		this.$load_castList_isWait.set(true);
		{
			this.$castList.set(undefined);
			this.$castListCount.set(undefined);
		}
		const params: any = this.$params();
		return this.api.post('page/castList/load_castList', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					this.$castList.set(results.castList || []);
					this.$castListCount.set(results.castListCount || 0);
					this.$load_castList_isWait.set(false);
				}),
				take(1)
			);
	}

	load_castList$ = (() => {
		const load_castList$ = new Subject();
		load_castList$
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				switchMap(() => this.load_castList())
			)
			.subscribe();
		return load_castList$;
	})();

	action_load_castList(): void {
		this.load_castList$.next(null);
	}

	remove_cast(cast: any): Observable<any> {
		const params: any = {cast: {...cast, _: null}};
		return this.api.post('page/castList/remove_cast', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => {
					this.$castList.update((castList: any) => {
						return castList.filter((cast: any) => cast.uid !== params.cast.uid);
					});
					this.$castListCount.update((castListCount: number) => {
						return castListCount - 1;
					});
				}),
				take(1)
			);
	}

	action_remove_cast(cast: any): void {
		if (!confirm('削除は取り消せません。')) {
			return;
		}
		this.remove_cast(cast)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

	action_cast_viewFlag(cast: any): void {
		this.notifyMessage.show('保存中...');
		cast._ = {...cast._, isWait: true};
		const params: any = {cast: {...cast, viewFlag: !cast.viewFlag, _: null}};
		this.api.post('page/castList/save_cast_viewFlag', params)
			.pipe(takeUntilDestroyed(this.#DestroyRef))
			.pipe(tap(({results}) => {
				cast.viewFlag = !!params.cast.viewFlag;
				cast._ = {...cast._, isWait: false};
				this.changeDetectorRef.markForCheck();
				this.notifyMessage.hide('保存しました');
			}))
			.subscribe();
	}

	add_castSection(cast: CastModel): void {
		const castSectionListComponent = this.$castSectionListComponent();
		castSectionListComponent?.add_castSection(cast)
			?.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(console.log),
				take(1)
			)
			?.subscribe();
	}
}
