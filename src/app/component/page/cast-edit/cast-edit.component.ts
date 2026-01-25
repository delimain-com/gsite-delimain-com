import {ChangeDetectorRef, Component, computed, DestroyRef, HostListener, inject, linkedSignal, NgZone, Signal, signal, WritableSignal} from '@angular/core';
import {injectQueryParams} from "ngxtension/inject-query-params";
import {Observable, take, tap} from "rxjs";
import {ApiService} from "../../../service/api/api.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SiteInfoService} from "../../../service/site-info/site-info.service";
import {NgbNav, NgbNavContent, NgbNavItem, NgbNavLinkButton, NgbNavOutlet} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {UtilService} from "../../../service/util/util.service";
import {ImageUtilService} from "../../../service/image-util/image-util.service";
import {SortablejsModule} from "nxt-sortablejs";
import {Options} from "sortablejs";
import {CdkDrag, CdkDragDrop, CdkDragEnter, CdkDragStart, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
import CastImageComponent from "./cast-image/cast-image.component";
import {NotifyMessageService} from "../../../service/notify-message/notify-message.service";

@Component({
	selector: 'app-cast-edit',
	imports: [
		NgbNav,
		NgbNavItem,
		NgbNavOutlet,
		NgbNavContent,
		NgbNavLinkButton,
		FormsModule,
		SortablejsModule,
		CdkDropList,
		CdkDrag,
		CastImageComponent,
	],
	templateUrl: './cast-edit.component.html',
	styleUrl: './cast-edit.component.scss',
})
export default class CastEditComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	public ngZone = inject(NgZone);

	public notifyMessage: NotifyMessageService = inject(NotifyMessageService);

	public changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

	public api: ApiService = inject(ApiService);

	public imageUtil: ImageUtilService = inject(ImageUtilService);

	public util: UtilService = inject(UtilService);
	public $q_uid: Signal<string | null> = injectQueryParams('uid');

	public $isReady: WritableSignal<boolean> = signal(false);
	public $state_save_isWait: WritableSignal<boolean> = signal(false);

	public siteInfo: SiteInfoService = inject(SiteInfoService);

	public $cast: WritableSignal<any> = linkedSignal({
		source: this.$q_uid,
		computation: (uid: any, previous: any) => {
			return {uid, regDatetime: Date.now(), viewFlag: true};
		}
	});
	public $castDetailList: WritableSignal<any> = signal(undefined);
	public $castDetailMap = computed(() => {
		const site_langList = this.siteInfo.$site_langList();
		const castDetailList = this.$castDetailList();
		const cast = this.$cast();
		if (!(castDetailList && cast?.uid && site_langList)) {
			return {};
		}
		const castDetailMap: any = castDetailList.reduce((castDetailMap: any, castDetail: any) => {
			castDetailMap[castDetail.lang] = castDetail;
			return castDetailMap;
		}, {});
		site_langList.forEach((site_lang: any) => {
			const lang = site_lang.lang;
			if (!castDetailMap[lang]) {
				castDetailMap[lang] = {
					uid: cast.uid,
					lang
				};
			}
		});
		return castDetailMap;
	});
	public $pageConfig: WritableSignal<any> = signal(undefined);
	public $castProfileList: WritableSignal<any> = signal(undefined);
	public $castProfileMapMap = computed(() => {
		const castProfileList = this.$castProfileList() || [];
		return castProfileList.reduce((castProfileMapMap: any, castProfile: any) => {
			if (!castProfileMapMap[castProfile.lang]) {
				castProfileMapMap[castProfile.lang] = {};
			}
			castProfileMapMap[castProfile.lang][castProfile.itemUid] = castProfile;
			return castProfileMapMap;
		}, {});
	});
	public $castProfileGroupList: WritableSignal<any> = signal(undefined);
	public $castProfileItemList: WritableSignal<any> = signal(undefined);
	public $castPlayList = signal(undefined);
	public $castPlayMap = computed(() => {
		const castPlayList: any = this.$castPlayList() || [];
		return castPlayList.reduce((castPlayMap: any, castPlay: any) => {
			castPlayMap[castPlay.itemUid] = castPlay;
			return castPlayMap;
		}, {});
	});

	public $castPlayGroupList: WritableSignal<any> = signal(undefined);
	public $castPlayItemList: WritableSignal<any> = signal(undefined);
	public $castPlayItemListMap = computed(() => {
		const castPlayItemList: any = this.$castPlayItemList() || [];
		return castPlayItemList.reduce((castPlayItemListMap: any, castPlayItem: any) => {
			if (!castPlayItemListMap[castPlayItem.groupUid]) {
				castPlayItemListMap[castPlayItem.groupUid] = [];
			}
			castPlayItemListMap[castPlayItem.groupUid].push(castPlayItem);
			return castPlayItemListMap;
		}, {});
	});
	public $castPlayInputList: WritableSignal<any> = signal(undefined);
	public $castPlayInputListMap = computed(() => {
		const castPlayInputList = this.$castPlayInputList() || [];
		return castPlayInputList.reduce((castPlayInputListMap: any, castPlayInput: any) => {
			if (!castPlayInputListMap[castPlayInput.groupUid]) {
				castPlayInputListMap[castPlayInput.groupUid] = [];
			}
			castPlayInputListMap[castPlayInput.groupUid].push(castPlayInput);
			return castPlayInputListMap;
		}, {});
	});

	private dragRef: any;
	private _canceledByEsc = false;

	// cdkDragStarted イベントから DragRef を取得
	onDragStarted(event: CdkDragStart) {
		this.dragRef = event.source._dragRef;
		this._canceledByEsc = false;
	}

	@HostListener('window:keyup', ['$event'])
	handleKeyboardEvent(event: KeyboardEvent) {
		if (event.key === 'Escape' && this.dragRef) {
			this._canceledByEsc = true;
			this.dragRef.reset(); // 元の位置に戻す
			document.dispatchEvent(new Event('mouseup')); // ドラッグ終了
		}
	}

	public castImageListSortableOptions: Options = {
		handle: '.handle',
		onSort: (e: any) => {
		},
		onUpdate: (e: any) => {
			this.ngZone.run(() => {
				const items: any = e.target?.parentElement?.items || [];
				let sort: number = Date.now();
				items.forEach((v: any) => v.sort = sort--);
				this.$castImageList.set([...this.$castImageList()]);
			});
		},

		onEnd: (e: any) => {
		},
	};
	public $castImageList: WritableSignal<any> = signal(undefined);
	public $castImageListMap = linkedSignal(() => {
		const castImageList: any = this.$castImageList() || [];
		const castImageListMap = castImageList
			.sort((a: any, b: any) => (b.sort || 0) - (a.sort || 0))
			.reduce((castImageListMap: any, castImage: any) => {
				const itemUid = castImage.itemUid;
				{
					if (!castImageListMap[itemUid]) {
						castImageListMap[itemUid] = [];
					}
					castImageListMap[itemUid].push(castImage);
				}
				return castImageListMap;
			}, {});
		return castImageListMap;
	});
	public $castImageItemList: WritableSignal<any> = signal(undefined);
	public $castIconList: WritableSignal<any> = signal(undefined);
	public $castIconMap = computed(() => {
		const castIconList: any = this.$castIconList() || [];
		return castIconList.reduce((castIconMap: any, castIcon: any) => {
			castIconMap[castIcon.itemUid] = castIcon;
			return castIconMap;
		}, {});
	});
	public $castIconItemList: WritableSignal<any> = signal(undefined);
	public $castIconItemListMap = computed(() => {
		const castIconItemList: any = this.$castIconItemList() || [];
		return castIconItemList.reduce((castIconItemListMap: any, castIconItem: any) => {
			const {groupUid} = castIconItem;
			if (!castIconItemListMap[groupUid]) {
				castIconItemListMap[groupUid] = [];
			}
			castIconItemListMap[groupUid].push(castIconItem);
			return castIconItemListMap;
		}, {});
	});
	public $castIconGroupList: WritableSignal<any> = signal(undefined);

	public $results: WritableSignal<any> = signal(undefined);

	constructor() {
		this.load()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => this.$isReady.set(true)),
				take(1)
			)
			.subscribe();
	}

	action_drop($event: CdkDragDrop<any>): void {
		if (!this._canceledByEsc) {
			const id = $event.container.id;
			const castImageListMap: any = this.$castImageListMap() || {};
			// const castImageList = this.filter(id);
			const castImageList = castImageListMap[id];
			moveItemInArray(castImageList, $event.previousIndex, $event.currentIndex);
			let sort = Date.now();
			castImageList.forEach((v: any) => v.sort = sort--);
		}
		this._canceledByEsc = false;
	}

	$load_isWait: WritableSignal<boolean> = signal(false);

	load(): Observable<any> {
		this.$load_isWait.set(true);
		const params: any = {query: {}};
		{
			params.query.uid = this.$q_uid();
		}
		return this.api.post('page/castEdit/load', params)
			.pipe(
				tap(({results}) => {
					{
						const now = Date.now();
						const cast = results.cast || {
							uid: this.$q_uid(),
							regDatetime: now,
							viewDatetime: now,
							viewFlag: true,
							sort: now
						};
						this.$cast.set(cast);
					}
					this.$castDetailList.set(results.castDetailList || []);
					{
						const pageConfig = {
							...results.pageConfig,
							castIcon: {useFlag: false},
							castPlay: {useFlag: false},
							castProfile: {useFlag: false},
							movieUrl: {useFlag: false},
							editUser: {useuFlag: false}
						};
						this.$pageConfig.set(pageConfig);
					}
					{
						this.$castProfileGroupList.set(results.castProfileGroupList || []);
						this.$castProfileItemList.set(results.castProfileItemList || []);
						this.$castProfileList.set(results.castProfileList || []);
					}
					{
						this.$castPlayGroupList.set(results.castPlayGroupList || []);
						this.$castPlayItemList.set(results.castPlayItemList || []);
						this.$castPlayInputList.set(results.castPlayInputList || []);
						this.$castPlayList.set(results.castPlayList || []);
					}
					{
						this.$castImageList.set(results.castImageList || []);
						this.$castImageItemList.set(results.castImageItemList || []);
					}
					{

						this.$castIconGroupList.set(results.castIconGroupList || []);
						this.$castIconItemList.set(results.castIconItemList || []);
						this.$castIconList.set(results.castIconList || []);
					}
					this.$results.set(results);
					this.$load_isWait.set(false);
				})
			);
	}

	input_castPlay(lang: string, item: any, inputUid: string): void {
		const cast = this.$cast();
		const castPlayMap: any = this.$castPlayMap();
		const itemUid = item.uid;
		const castPlayInputList = this.$castPlayInputListMap()?.[item.groupUid] || [];
		const input = castPlayInputList.find((input: any) => input.uid === inputUid) || {};
		if (!castPlayMap[itemUid]) {
			castPlayMap[itemUid] = {};
		}
		Object.assign(castPlayMap[itemUid], {
			castUid: cast.uid,
			itemUid: item.uid,
			inputUid: input.uid,
			inputValue: input.value,
			value: input.value,
			sort: 0
		});
	}

	change_castProfile(lang: any, itemUid: any, value: any): void {
		const cast = this.$cast();
		const castUid = cast.uid;
		const castProfileMapMap = this.$castProfileMapMap() || {};
		const castProfileMap = castProfileMapMap[lang] || (castProfileMapMap[lang] = {});
		const castProfile = castProfileMap[itemUid] || (castProfileMap[itemUid] = {castUid, lang, itemUid, sort: 0});
		castProfile.value = value;
	}

	action_save(): void {
		this.save()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

	action_add_castImage(item: any): void {
		const maxLimit = item.maxLimit;
		const itemUid = item.uid;
		const castImageListMap = this.$castImageListMap() || {};
		if (castImageListMap[itemUid]?.length >= maxLimit) {
			return;
		}
		const cast = this.$cast();
		const castImage = {
			castUid: cast.uid,
			itemUid,
			imagePath: '',
			imageSrc: '',
			cache: false,
			sort: Date.now()
		};
		if (!castImageListMap[itemUid]) {
			castImageListMap[itemUid] = [];
		}
		castImageListMap[itemUid].unshift(castImage);
	}

	onEntered($event: CdkDragEnter) {
		const drag = $event.item;
		const drop = $event.container;

		if (drag.dropContainer === drop) {
			return;
		}

		// 両方のコンテナの要素を即座に入れ替え
		const dragData = drag.dropContainer.data;
		const dropData = drop.data;

		const dragIndex = dragData.indexOf(drag.data);
		const dropIndex = 0; // または特定のインデックス

		const temp = dragData[dragIndex];
		dragData[dragIndex] = dropData[dropIndex];
		dropData[dropIndex] = temp;
	}

	save(): Observable<any> {
		this.notifyMessage.show('保存中...');
		this.$state_save_isWait.set(true);
		const cast = this.$cast();
		const castImageListMap = this.$castImageListMap() || {};
		const castImageList = Object.values(castImageListMap).flat().map((v: any) => ({...v, _: null}));
		{
			const image = castImageListMap?.main?.at(0) || {};
			cast.imagePath = image.imagePath;
			cast.imageSrc = image.imageSrc;
		}
		const params: any = {
			cast,
			castDetailList: Object.values(this.$castDetailMap()).filter((v: any) => !!v.lang),
			castPlayList: Object.values(this.$castPlayMap() || {}),
			castProfileList: Object.values(this.$castProfileMapMap()).flatMap((map: any) => Object.values(map)),
			castIconList: Object.values(this.$castIconMap() || {}),
			castImageList
		};
		return this.api.post('page/castEdit/save', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => {
					this.$state_save_isWait.set(false);
					this.notifyMessage.hide('保存しましました');
				}),
				take(1)
			);
	}

	action_remove_castImage(castImageList: any, castImage: any): void {
		this.util.remove(castImageList, castImage);
	}
}
