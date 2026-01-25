import {Component, computed, DestroyRef, effect, inject, input, output, Signal, signal, viewChild, WritableSignal} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {Observable, take, tap} from "rxjs";
import {ApiService} from "../../../../service/api/api.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {JsonPipe} from "@angular/common";
import {CastModel} from "../../../../model/cast.model";
import {CastSectionModel} from "../../../../model/cast-section.model";
import {UtilService} from "../../../../service/util/util.service";
import {Options} from 'sortablejs';
import {SortablejsModule} from "nxt-sortablejs";
import {NotifyMessageService} from "../../../../service/notify-message/notify-message.service";

@Component({
	selector: 'app-cast-section-list',
	imports: [
		SortablejsModule
	],
	templateUrl: './cast-section-list.component.html',
	styleUrl: './cast-section-list.component.scss',
})
export default class CastSectionListComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	private api: ApiService = inject(ApiService);
	public util: UtilService = inject(UtilService);

	private notifyMessage: NotifyMessageService = inject(NotifyMessageService);

	$select_castSectionItem = input.required<any>({alias: 'select_castSectionItem'});

	$castSectionList: WritableSignal<CastSectionModel[] | undefined> = signal(undefined);
	$castSectionMap: Signal<any> = computed(() => {
		const castSectionList = this.$castSectionList() || [];
		const castSectionMap = castSectionList.reduce((castSectionMap: any, castSection: any) => {
			castSectionMap[castSection.castUid] = castSection;
			return castSectionMap;
		}, {});
		return castSectionMap;
	});

	castSectionListSortableOptions: Options = {
		handle: '.handle',
		onUpdate: ((e: any) => {
			const params: any = {};
			{
				let sort = Date.now();
				params.castSectionList = this.$castSectionList()?.map((castSection: CastSectionModel) => {
					return {
						...castSection,
						sort: sort--
					};
				});
			}
			this.notifyMessage.show('保存中...');
			this.api.post('page/castList/save_castSectionList', params)
				.pipe(
					takeUntilDestroyed(this.#DestroyRef),
					tap(() => {
						this.$castSectionList.set(params.castSectionList);
						this.notifyMessage.hide('保存しました');
					}),
					take(1)
				)
				.subscribe();
		})

	};

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

	add_castSection(cast: CastModel): Observable<any> {
		const castSection: CastSectionModel = {
			itemUid: this.$select_castSectionItem()?.uid,
			castUid: cast.uid,
			sort: Date.now(),
			castName: cast.name,
			castImagePath: cast.imagePath,
			castImageSrc: cast.imageSrc,
			castAge: cast.age
		};
		const castSectionList = this.$castSectionList() || [];
		const remove_castSection = castSectionList.find((castSection: CastSectionModel) => castSection.castUid === cast.uid);
		remove_castSection && this.util.remove(castSectionList, remove_castSection);
		castSectionList.unshift(castSection);
		const params: any = {castSectionList};
		return this.api.post('page/castList/save_castSectionList', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(console.log),
				take(1)
			);
	}

	action_remove_castSection(castSection: CastSectionModel): void {
		if (!confirm('削除は取り消せません。')) {
			return;
		}
		const params: any = {castSection: {...castSection, _: null}};
		this.notifyMessage.show('削除中...');
		this.api.post('page/castList/remove_castSection', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => {
					this.$castSectionList.update((castSectionList: any) => {
						return castSectionList.filter((v: any) => v.castUid !== castSection.castUid);
					});
					this.notifyMessage.hide('削除しました');
				}),
				take(1)
			)
			.subscribe();
	}

}
