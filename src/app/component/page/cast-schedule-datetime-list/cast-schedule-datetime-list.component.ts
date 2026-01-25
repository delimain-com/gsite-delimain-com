import {Component, computed, DestroyRef, effect, inject, signal, WritableSignal} from '@angular/core';
import {UtilService} from "../../../service/util/util.service";
import {ApiService} from "../../../service/api/api.service";
import {Observable, of, take, tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {DecimalPipe, JsonPipe} from "@angular/common";
import {CastScheduleDatetimeModel} from "../../../model/cast-schedule-datetime.model";
import {NavigationService} from "../../../service/navigation/navigation.service";
import {FormsModule} from "@angular/forms";
import {NotifyMessageService} from "../../../service/notify-message/notify-message.service";
import {RouterLink} from "@angular/router";
import {SiteInfoService} from "../../../service/site-info/site-info.service";

@Component({
	selector: 'app-cast-schedule-datetime-list',
	imports: [
		DecimalPipe,
		FormsModule,
		JsonPipe,
		RouterLink
	],
	templateUrl: './cast-schedule-datetime-list.component.html',
	styleUrl: './cast-schedule-datetime-list.component.scss',
})
export default class CastScheduleDatetimeListComponent {

	#DestroyRef: DestroyRef = inject(DestroyRef);

	public util: UtilService = inject(UtilService);
	private api: ApiService = inject(ApiService);

	public siteInfo: SiteInfoService = inject(SiteInfoService);

	public $isReady: WritableSignal<boolean> = signal(false);

	public notifyMessage: NotifyMessageService = inject(NotifyMessageService);

	public $castScheduleDatetimeList: WritableSignal<CastScheduleDatetimeModel[] | undefined> = signal(undefined);
	public $castScheduleDatetimeListCount: WritableSignal<number | undefined> = signal(undefined);

	public $q_scheduleDate: WritableSignal<any> = signal(new Date());

	public $q_page: WritableSignal<number> = signal(1);
	public $q_limit: WritableSignal<number> = signal(100);

	public $params = computed(() => {
		const params: any = {query: {}};
		{
			params.query.scheduleDate = this.util.m(this.$q_scheduleDate()).toDate().getTime();
			params.query.limit = this.$q_limit();
			params.query.offset = ((this.$q_page() - 1) * this.$q_limit());
		}
		return params;
	});

	public $results: WritableSignal<any> = signal({});

	public $inputList: WritableSignal<any> = signal([
		{
			"label": "",
			"value": undefined
		},
		{
			"label": "00:00",
			"value": "00:00:00"
		},
		{
			"label": "00:30",
			"value": "00:30:00"
		},
		{
			"label": "01:00",
			"value": "01:00:00"
		},
		{
			"label": "01:30",
			"value": "01:30:00"
		},
		{
			"label": "02:00",
			"value": "02:00:00"
		},
		{
			"label": "02:30",
			"value": "02:30:00"
		},
		{
			"label": "03:00",
			"value": "03:00:00"
		},
		{
			"label": "03:30",
			"value": "03:30:00"
		},
		{
			"label": "04:00",
			"value": "04:00:00"
		},
		{
			"label": "04:30",
			"value": "04:30:00"
		},
		{
			"label": "05:00",
			"value": "05:00:00"
		},
		{
			"label": "05:30",
			"value": "05:30:00"
		},
		{
			"label": "06:00",
			"value": "06:00:00"
		},
		{
			"label": "06:30",
			"value": "06:30:00"
		},
		{
			"label": "07:00",
			"value": "07:00:00"
		},
		{
			"label": "07:30",
			"value": "07:30:00"
		},
		{
			"label": "08:00",
			"value": "08:00:00"
		},
		{
			"label": "08:30",
			"value": "08:30:00"
		},
		{
			"label": "09:00",
			"value": "09:00:00"
		},
		{
			"label": "09:30",
			"value": "09:30:00"
		},
		{
			"label": "10:00",
			"value": "10:00:00"
		},
		{
			"label": "10:30",
			"value": "10:30:00"
		},
		{
			"label": "11:00",
			"value": "11:00:00"
		},
		{
			"label": "11:30",
			"value": "11:30:00"
		},
		{
			"label": "12:00",
			"value": "12:00:00"
		},
		{
			"label": "12:30",
			"value": "12:30:00"
		},
		{
			"label": "13:00",
			"value": "13:00:00"
		},
		{
			"label": "13:30",
			"value": "13:30:00"
		},
		{
			"label": "14:00",
			"value": "14:00:00"
		},
		{
			"label": "14:30",
			"value": "14:30:00"
		},
		{
			"label": "15:00",
			"value": "15:00:00"
		},
		{
			"label": "15:30",
			"value": "15:30:00"
		},
		{
			"label": "16:00",
			"value": "16:00:00"
		},
		{
			"label": "16:30",
			"value": "16:30:00"
		},
		{
			"label": "17:00",
			"value": "17:00:00"
		},
		{
			"label": "17:30",
			"value": "17:30:00"
		},
		{
			"label": "18:00",
			"value": "18:00:00"
		},
		{
			"label": "18:30",
			"value": "18:30:00"
		},
		{
			"label": "19:00",
			"value": "19:00:00"
		},
		{
			"label": "19:30",
			"value": "19:30:00"
		},
		{
			"label": "20:00",
			"value": "20:00:00"
		},
		{
			"label": "20:30",
			"value": "20:30:00"
		},
		{
			"label": "21:00",
			"value": "21:00:00"
		},
		{
			"label": "21:30",
			"value": "21:30:00"
		},
		{
			"label": "22:00",
			"value": "22:00:00"
		},
		{
			"label": "22:30",
			"value": "22:30:00"
		},
		{
			"label": "23:00",
			"value": "23:00:00"
		},
		{
			"label": "23:30",
			"value": "23:30:00"
		},
		{
			"label": "24:00",
			"value": "24:00:00"
		}
	]);

	constructor() {
		this.load()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => this.$isReady.set(true)),
				take(1)
			)
			.subscribe();
	}

	$load_isWait: WritableSignal<boolean> = signal(false);

	load(): Observable<any> {
		this.$load_isWait.set(true);
		{
			this.$castScheduleDatetimeList.set(undefined);
		}
		const params: any = this.$params();
		return this.api.post('page/castScheduleDatetimeList/load', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(console.log),
				tap(({results}) => {
					this.$results.set(results);
					this.$castScheduleDatetimeList.set(results.castScheduleDatetimeList || []);
					this.$castScheduleDatetimeListCount.set(results.castScheduleDatetimeListCount || 0);
					this.$load_isWait.set(false);
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

	$load_castScheduleDatetimeList_isWait: WritableSignal<boolean> = signal(false);

	load_castScheduleDatetimeList(): Observable<any> {
		{
			this.$castScheduleDatetimeList.set(undefined);
			this.$castScheduleDatetimeListCount.set(undefined);
		}
		const params: any = this.$params();
		if (!this.util.m(params?.query?.scheduleDate).isValid()) {
			return of();
		}
		this.$load_castScheduleDatetimeList_isWait.set(true);
		return this.api.post('page/castScheduleDatetimeList/load_castScheduleDatetimeList', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(({results}) => {
					this.$castScheduleDatetimeList.set(results.castScheduleDatetimeList || []);
					this.$castScheduleDatetimeListCount.set(results.castScheduleDatetimeListCount || 0);
					this.$load_castScheduleDatetimeList_isWait.set(false);
				}),
				take(1)
			);
	}

	action_load_castScheduleDatetimeList(): void {
		this.load_castScheduleDatetimeList()
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				take(1)
			)
			.subscribe();
	}

	action_select_schedule(castScheduleDatetime: CastScheduleDatetimeModel) {
		castScheduleDatetime.scheduleDate = this.util.m(this.$q_scheduleDate()).toDate().getTime();
		const params: any = {castScheduleDatetime};
		this.notifyMessage.show('保存中...');
		this.api.post('page/castScheduleDatetimeList/save_castScheduleDatetime', params)
			.pipe(
				takeUntilDestroyed(this.#DestroyRef),
				tap(() => {
					this.notifyMessage.hide('保存しました');
				}),
				take(1)
			)
			.subscribe();
	}

	action_clear_schedule(castScheduleDatetime: CastScheduleDatetimeModel): void {
	}

}
